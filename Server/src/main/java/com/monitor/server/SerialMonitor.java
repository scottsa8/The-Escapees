package com.monitor.server;
import java.net.MalformedURLException;
import com.fazecast.jSerialComm.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
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
                if (DEBUG) {

                }
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
                    String ambientLight = sensorData[3];
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
                            insertStatement.setBigDecimal(5, new BigDecimal(ambientLight));
                            insertStatement.executeUpdate();
                        } else {
                            // Handle the case where the microbitName does not correspond to any room
                            System.out.println("No room found for microbitName: " + microbitName);
                        }
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
                else if (packetType == 3) { // head count
                    String roomMicrobit = sensorData[1];
                
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
                
                            // Increment head_count for the matching room
                            PreparedStatement updateHeadCountStatement = connection.prepareStatement(
                                    "UPDATE rooms SET head_count = head_count + 1 WHERE room_id = ?"
                            );
                            updateHeadCountStatement.setInt(1, roomID);
                            updateHeadCountStatement.executeUpdate();
                
                            System.out.println("Head count incremented for room with microbit: " + roomMicrobit);
                        } else {
                            // Handle the case where the roomMicrobit does not correspond to any room
                            System.out.println("No room found for roomMicrobit: " + roomMicrobit);
                        }
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }
 
    public void stop(){
        microbit.closePort();
    }
}