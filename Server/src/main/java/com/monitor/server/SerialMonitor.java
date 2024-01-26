package com.monitor.server;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import com.fazecast.jSerialComm.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.net.URL;
import java.sql.*;

public class SerialMonitor {
    private boolean DEBUG=true;
    private URL url = new URL("http://localhost:8080");
    private LocalTime hour = LocalTime.now();
    private LocalTime nextHour;
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


        // Get the appropriate port and open
        microbit = SerialPort.getCommPort("COM12");
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
                hour = LocalTime.now();
                nextHour = ServerApplication.nextHour;
                byte[] delimitedMessage = event.getReceivedData();
                String data = new String(delimitedMessage);
                if (DEBUG) {
                    System.out.println(data);
                }
                else {
                    String[] sensorData = data.split(",");
                    if (sensorData [0] == "1") {
                        System.out.println("Location");
                    }
                    else if (sensorData[0] == "2") {
                        System.out.println("Environment");
                        String temperature = sensorData[0];
                        String noiseLevel = sensorData[1];
                        String ambientLight = sensorData[2];
    
                        try {
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
                        } catch (SQLException e) {
                            e.printStackTrace();
                        }
                    }
                    else {
                        System.out.println("Unknown message");
                    }
                }
            }
        });
    }
 
    public void stop(){
        microbit.closePort();
    }
}