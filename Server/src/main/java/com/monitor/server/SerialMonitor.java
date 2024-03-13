package com.monitor.server;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import com.fazecast.jSerialComm.*;
import java.time.LocalDateTime;
import java.math.RoundingMode;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.sql.*;

public class SerialMonitor {
    private boolean DEBUG=true;
    private URL url = new URL("http://localhost:8080");
    private SerialPort microbit;
    private Connection connection;
    private Map<String, String> messageMap = new HashMap<>(); // Map to store microbit name and corresponding message
    private int packetSize = 10;

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
                microbit.setComPortTimeouts(SerialPort.TIMEOUT_NONBLOCKING,0,0);
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
                 if(data == "PANIC"){
                    System.out.println("Panicking");
                    panic();
                }
                String[] sensorData = data.split(",");
                int packetType;
                try{
                    packetType= Integer.parseInt(sensorData[0]);
                }catch (Exception e){
                    return;
                }
                if (packetType == 1) { //moving device
                    if(sensorData.length!=3){
                        return;
                    }
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
                    if (sensorData.length!=5) {
                        return;
                    } else if (sensorData[1].length()<4) {
                        return;
                    }

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
                            int scaledNoiseLevel;
                            int scaledLightLevel;
                            // Scale noise level to the range [0, 100]
                            if(Double.parseDouble(noiseLevel)>100){
                                scaledNoiseLevel  = 100;
                            }else{
                                scaledNoiseLevel = (int) ((Double.parseDouble(noiseLevel) / 100) * 100);
                            }
                           //
                            if(( lightLevel.doubleValue())>100){
                                scaledLightLevel  = 100;
                            }else{
                                scaledLightLevel = (int) ((lightLevel.doubleValue() / 1000) * 100);
                            }
                            // Scale light level to the range [0, 100]
                             //
                
                            // Insert data into the database
                            PreparedStatement insertStatement = connection.prepareStatement(
                                "INSERT INTO roomEnvironment (room_id, timestamp, temperature, noise_level, light_level) VALUES (?, ?, ?, ?, ?)"
                            );
                            insertStatement.setInt(1, roomID);
                            insertStatement.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
                            insertStatement.setString(3, temperature);
                            insertStatement.setInt(4, scaledNoiseLevel);
                            insertStatement.setInt(5, scaledLightLevel);
                            insertStatement.executeUpdate();
                            PreparedStatement getRoom = connection.prepareStatement(
                                    "SELECT room_name FROM rooms WHERE room_microbit=?"
                            );
                            getRoom.setString(1, microbitName);
                            ResultSet rs = getRoom.executeQuery();
                            String roomName = "";
                            if(rs.next()){
                                roomName=rs.getString("room_name");
                            }
                            checkForNoti(roomName,roomID);

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
                else if (packetType == 4) { // Door lock packet
                    String microbitName = sensorData[1];
                    String state = sensorData[2];
                
                    try {
                        // Retrieve door_id based on door_microbit
                        PreparedStatement selectDoorIdStatement = connection.prepareStatement(
                            "SELECT door_id FROM doors WHERE door_microbit = ?"
                        );
                        selectDoorIdStatement.setString(1, microbitName);
                        ResultSet doorResult = selectDoorIdStatement.executeQuery();
                
                        // Check if a door with the specified door_microbit exists
                        if (doorResult.next()) {
                            int doorID = doorResult.getInt("door_id");
                
                            // Update the state of the door in doorHistory
                            PreparedStatement updateDoorStateStatement = connection.prepareStatement(
                                "INSERT INTO doorHistory (door_id, is_locked, change_timestamp) VALUES (?, ?, ?)"
                            );
                            updateDoorStateStatement.setInt(1, doorID);
                            updateDoorStateStatement.setBoolean(2, state.equals("True")); // Assuming state is a string "true" or "false"
                            updateDoorStateStatement.setTimestamp(3, Timestamp.valueOf(LocalDateTime.now()));
                            updateDoorStateStatement.executeUpdate();
                        } else {
                            // Handle the case where the microbitName does not correspond to any door
                            System.out.println("No door found for microbitName: " + microbitName);
                        }
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }  
                else if (packetType == 5) { // Acknowledgement from the microbit that it received the last message packet
                    sendNextPacket(data);
                }
                else{
                    System.out.println("someone elses shit");
                    data="";
                    return;
                }
            }
        });
    }
    public void checkForNoti(String roomName,int roomID){
        int maxTemp=0;int maxNL=0;int maxLL=0;
        int currTemp=0;int currNL=0;int currLL=0;
        boolean overTemp=false; boolean overNL=false; boolean overLL=false;
        Timestamp timestamp = null;
        try {
            PreparedStatement selectData = connection.prepareStatement(
                    "SELECT max_temperature, max_noise_level, max_light_level FROM rooms WHERE room_name=?"
            );
            selectData.setString(1,roomName);
            ResultSet maxResults = selectData.executeQuery();
            if(maxResults.next()){
                maxTemp=maxResults.getInt("max_Temperature");
                maxNL=maxResults.getInt("max_noise_level");
                maxLL=maxResults.getInt("max_light_level");
            }

            PreparedStatement getMostRecent = connection.prepareStatement(
                    "SELECT temperature,noise_level,light_level,timestamp FROM roomenvironment WHERE room_id=? ORDER BY timestamp DESC"
            );
            getMostRecent.setInt(1,roomID);
            ResultSet mostRecent = getMostRecent.executeQuery();
            if(mostRecent.next()){
                currTemp=mostRecent.getInt("temperature");
                currNL=mostRecent.getInt("noise_level");
                currLL=mostRecent.getInt("light_level");
                timestamp=mostRecent.getTimestamp("timestamp");
            }
            if(currTemp>maxTemp){
                overTemp=true;
            }
            if(currNL>maxNL){
                overNL=true;
            }
            if(currLL>maxLL){
                overLL=true;
            }
            ServerApplication.setNoti(roomName, String.valueOf(timestamp).substring(0,String.valueOf(timestamp).length()-5),overTemp,overNL,overLL);

        }catch (Exception e){
            e.printStackTrace();
        }
    }
    public void panic() {
        try {
            // Retrieve all users with type "guard"
            PreparedStatement selectGuardsStatement = connection.prepareStatement(
                    "SELECT user_microbit FROM users WHERE user_type = 'guard'"
            );
            ResultSet guardsResult = selectGuardsStatement.executeQuery();

            List<String> guardMicrobits = new ArrayList<>();
            while (guardsResult.next()) {
                String guardMicrobit = guardsResult.getString("user_microbit");
                guardMicrobits.add(guardMicrobit);
            }

            // Send "PANIC" message to all guard microbits
            for (String guardMicrobit : guardMicrobits) {
                sendMessage(guardMicrobit, "PANIC");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void sendMessage(String microbitName, String message) { 
        if (microbit != null && microbit.isOpen()) {
            // Store the message in the map
            messageMap.put(microbitName, message);
            try {
                // Convert the message to bytes
                byte[] messageBytes = message.getBytes("UTF-8");
    
                // Send only the first packet
                int packetNumber = 0;
                int startIdx = packetNumber * packetSize;
                int endIdx = Math.min((packetNumber + 1) * packetSize, messageBytes.length);
                byte[] packetBytes = Arrays.copyOfRange(messageBytes, startIdx, endIdx);
    
                // Create a new packet with microbit name, packet number, and packet data
                String packetMessage ="."+microbitName+","+packetNumber+","+new String(packetBytes, "UTF-8");
                System.out.println(packetMessage);
            
                String initMessage = "Recv";
                microbit.writeBytes(initMessage.getBytes("UTF-8"), initMessage.length());

                Thread.sleep(500);
    
                // Send the full packet to the receiver microbit
                microbit.writeBytes(packetMessage.getBytes("UTF-8"), packetMessage.length());
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Microbit not available or port not open.");
        }
    }
    
    public void sendNextPacket(String data) {
        // Check if the data is not empty and starts with "5"
        if (data != null && data.startsWith("5")) {
            // Split the data into parts and ensure that there are enough parts
            String[] parts = data.substring(1).split(",");
            if (parts.length >= 2) {
                // Extract microbit name and packet number
                String microbitName = parts[1];
                int packetNumber = Integer.parseInt(parts[2]) + 1; // Get the packet after the one acknowledged


                // Iterate over the entry set and print each entry
                for (Map.Entry<String, String> entry : messageMap.entrySet()) {
                    System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());
                }

                // Check if there's a stored message for the microbit
                if (messageMap.containsKey(microbitName)) {
                    // Retrieve the stored message
                    String message = messageMap.get(microbitName);

                    // Convert the message to bytes and calculate the total number of packets needed
                    byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
                    int totalPackets = (int) Math.ceil((double) messageBytes.length / packetSize);
    
                    // Check if the packet number is within the valid range
                    if (packetNumber > 0 && packetNumber <= totalPackets) {
                        // Calculate the start and end indices for the current packet
                        int startIdx = (packetNumber) * packetSize;
                        int endIdx = startIdx + packetSize;
                        byte[] packetBytes = Arrays.copyOfRange(messageBytes, startIdx, endIdx);

                        // Create a new packet with microbit name, packet number, and packet data
                        String packetMessage ="."+microbitName+","+packetNumber+","+new String(packetBytes, StandardCharsets.UTF_8);
                        System.out.println(packetMessage);

                        // Send the full packet to the receiver microbit
                        try {
                            microbit.writeBytes(packetMessage.getBytes(StandardCharsets.UTF_8), packetMessage.length());
                        } catch (Exception e) {
                            e.printStackTrace();
                        }

                        // Check if this is the last packet and remove the message from the hashmap if so
                        if (packetNumber == totalPackets) {
                            messageMap.remove(microbitName);
                        }
                    } else {
                        System.out.println("Invalid packet number: " + packetNumber);
                    }
                } else {
                    System.out.println("No stored message for microbit: " + microbitName);
                }
            } else {
                System.out.println("Invalid data format: " + data);
            }
        } else {
            System.out.println("Invalid data: " + data);
        }
    }
    
    public void stop(){
        try{
            microbit.closePort();
        }catch (Exception e){}

    }
}
