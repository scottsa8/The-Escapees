package com.monitor.server;
import java.net.MalformedURLException;
import com.fazecast.jSerialComm.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.sql.*;

public class SerialMonitor {
    private boolean DEBUG=true;
    private URL url = new URL("http://localhost:8080");
    private SerialPort microbit;
    private Connection connection;

    public SerialMonitor(Connection connection) throws MalformedURLException {
        this.connection = connection;
    }

    public void start() throws Exception {
        /*
    *         IF YOU GET AN IMPORT ERROR
    *   File > project structure > libraries > click the + sign
    *   Add from Maven, search for "JSerialComm"
    *   Add the one from "fazecast"
    *   Add to Monitor, NOT application
    *   This should add the required dependency  */

        // List all the ports available
        if(DEBUG){
            for(SerialPort s : SerialPort.getCommPorts()) {
                System.out.println("Serial Port: " + s.getDescriptivePortName());
            }
        }

        //Set port
        SerialPort[] ports = SerialPort.getCommPorts();
        for (SerialPort port : ports) {
            if (port.getDescriptivePortName().contains("USB Serial Device")) {
                microbit = port;
                break;
            }
        }
        if (microbit == null) {
            System.out.println("Microbit is not found");
            throw new Exception("Microbit not found");
        }
        microbit.openPort();

        // Set the baud rate
        if(microbit.isOpen()) {
            if(DEBUG){
                System.out.println("Initializing...");
            }
            microbit.setBaudRate(115200);
        }
        else {
            if(DEBUG){
                System.out.println("Port not found");
            }
            throw new Exception("no port");
        }

        // Add data listener to the SerialPort
        microbit.addDataListener(new SerialPortMessageListener() {
            @Override
            public int getListeningEvents() {
                return SerialPort.LISTENING_EVENT_DATA_RECEIVED;
            }

            @Override
            public byte[] getMessageDelimiter() {
                return new byte[]{System.getProperty("line.separator").getBytes()[0]};
            }

            @Override
            public boolean delimiterIndicatesEndOfMessage() {
                return true;
            }

            @Override
            public void serialEvent(SerialPortEvent event) {
                byte[] delimitedMessage = event.getReceivedData();
                String data = new String(delimitedMessage);
                data = data.strip();
                System.out.println("INPUT:" + data);
                String[] sensorData = data.split(",");
                int packetType = Integer.parseInt(sensorData[0]);
                if (packetType == 1) { //moving device
                    String deviceName = sensorData[1];
                    String roomMicrobit = sensorData[2];
                
                    try {
                        // Retrieve room_id based on room_microbit
                        PreparedStatement selectRoomIdStatement = connection.prepareStatement(
                            "SELECT room_id FROM rooms WHERE room_microbit = ?"
                        );
                        selectRoomIdStatement.setString(1, roomMicrobit);
                        ResultSet roomResult = selectRoomIdStatement.executeQuery();
                
                        // Check if a room with the specified room_microbit exists
                        if (roomResult.next()) {
                            int roomID = roomResult.getInt("room_id");                
                            // Retrieve user_id based on user_microbit
                            PreparedStatement selectUserIdStatement = connection.prepareStatement(
                                "SELECT user_id FROM users WHERE user_microbit = ?"
                            );
                            selectUserIdStatement.setString(1, deviceName);
                            ResultSet userResult = selectUserIdStatement.executeQuery();
                
                            // Check if a user with the specified user_microbit exists
                            if (userResult.next()) {
                                int userID = userResult.getInt("user_id");                
                                // Retrieve the last recorded room for the user
                                PreparedStatement selectLastRoomStatement = connection.prepareStatement(
                                    "SELECT room_id FROM roomOccupants " +
                                    "WHERE user_id = ? " +
                                    "ORDER BY entry_timestamp DESC " +
                                    "LIMIT 1"
                                );
                                selectLastRoomStatement.setInt(1, userID);
                                ResultSet lastRoomResult = selectLastRoomStatement.executeQuery();
                
                                // Check if there is a last recorded room
                                if (!lastRoomResult.next() || lastRoomResult.getInt("room_id") != roomID) {
                                    // Insert data into the database for movement
                                    PreparedStatement insertStatement = connection.prepareStatement(
                                        "INSERT INTO roomOccupants (room_id, user_id, entry_timestamp) VALUES (?, ?, ?)"
                                    );
                                    insertStatement.setInt(1, roomID);
                                    insertStatement.setInt(2, userID);
                                    insertStatement.setTimestamp(3, Timestamp.valueOf(LocalDateTime.now()));
                                    insertStatement.executeUpdate();
                                } else {
                                    // Handle the case where the last recorded room is the same as the current room
                                    System.out.println("User is already in the same room. No new record added.");
                                }
                            } else {
                                // Handle the case where the deviceName does not correspond to any user
                                System.out.println("No user found for deviceName: " + deviceName);
                            }
                        } else {
                            // Handle the case where the roomMicrobit does not correspond to any room
                            System.out.println("No room found for roomMicrobit: " + roomMicrobit);
                        }
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }                               
                else if (packetType == 2) { //env
                    String microbitName = sensorData[1];
                    String temperature = sensorData[2];
                    BigDecimal lightLevel = new BigDecimal(sensorData[3]).setScale(2, RoundingMode.HALF_EVEN);
                    String noiseLevel = sensorData[4];
                    
                    try {
                        // Retrieve room_id based on room_microbit
                        PreparedStatement selectRoomIdStatement = connection.prepareStatement(
                            "SELECT room_id FROM rooms WHERE room_microbit = ?"
                        );
                        selectRoomIdStatement.setString(1, microbitName);
                        ResultSet roomResult = selectRoomIdStatement.executeQuery();
                
                        // Check if a room with the specified microbitName exists
                        if (roomResult.next()) {
                            int roomID = roomResult.getInt("room_id");                
                            // Insert data into the database
                            PreparedStatement insertStatement = connection.prepareStatement(
                                "INSERT INTO roomEnvironment (room_id, timestamp, temperature, noise_level, light_level) VALUES (?, ?, ?, ?, ?)"
                            );
                            insertStatement.setInt(1, roomID);
                            insertStatement.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
                            insertStatement.setBigDecimal(3, new BigDecimal(temperature));
                            insertStatement.setBigDecimal(4, new BigDecimal(noiseLevel));
                            insertStatement.setBigDecimal(5, lightLevel);
                            insertStatement.executeUpdate();
                        } else {
                            // Handle the case where the microbitName does not correspond to any room
                            System.out.println("No room found for microbitName: " + microbitName);
                        }
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
                else if (packetType == 3) { // head count update
                    String roomMicrobit = sensorData[1];
                    try {
                        // Get the latest head count for the specified room from headCountHistory
                        PreparedStatement selectHeadCountStatement = connection.prepareStatement(
                            "SELECT r.room_id, r.room_microbit, MAX(h.head_count) AS latest_head_count " +
                            "FROM headCountHistory h " +
                            "JOIN rooms r ON h.room_id = r.room_id " +
                            "WHERE r.room_microbit = ? " +
                            "GROUP BY r.room_id"
                        );
                        selectHeadCountStatement.setString(1, roomMicrobit);
                        ResultSet headCountResult = selectHeadCountStatement.executeQuery();
                
                        // Check if there is a result
                        if (headCountResult.next()) {
                            int roomID = headCountResult.getInt("room_id");
                            String roomMicrobitResult = headCountResult.getString("room_microbit");
                            int latestHeadCount = headCountResult.getInt("latest_head_count");
                
                            // Increment the latest head count and insert a new record
                            int newHeadCount = latestHeadCount + 1;
                            PreparedStatement insertHeadCountStatement = connection.prepareStatement(
                                "INSERT INTO headCountHistory (room_id, head_count, change_timestamp) VALUES (?, ?, ?)"
                            );
                            insertHeadCountStatement.setInt(1, roomID);
                            insertHeadCountStatement.setInt(2, newHeadCount);
                            insertHeadCountStatement.setTimestamp(3, Timestamp.valueOf(LocalDateTime.now()));
                            insertHeadCountStatement.executeUpdate();
                        } else {
                            // If no record found, add a new record with the count set to 1
                            PreparedStatement selectRoomIDStatement = connection.prepareStatement(
                                "SELECT room_id FROM rooms WHERE room_microbit = ?"
                            );
                            selectRoomIDStatement.setString(1, roomMicrobit);
                            ResultSet roomIDResult = selectRoomIDStatement.executeQuery();
                
                            if (roomIDResult.next()) {
                                int roomID = roomIDResult.getInt("room_id");
                
                                // Insert a new record with the count set to 1
                                PreparedStatement insertHeadCountStatement = connection.prepareStatement(
                                    "INSERT INTO headCountHistory (room_id, head_count, change_timestamp) VALUES (?, 1, ?)"
                                );
                                insertHeadCountStatement.setInt(1, roomID);
                                insertHeadCountStatement.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
                                insertHeadCountStatement.executeUpdate();
                            }
                        }
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
                                               
            }
        });
    }

    public void sendMessage(String message) {
        if (microbit != null && microbit.isOpen()) {
            try {
                // Convert the message to bytes and send it to the microbit
                byte[] messageBytes = message.getBytes();
                microbit.writeBytes(messageBytes, messageBytes.length);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Microbit not available or port not open.");
        }
    }  
 
    public void stop(){
        try{
            microbit.closePort();
        }catch (Exception e){}

    }
}