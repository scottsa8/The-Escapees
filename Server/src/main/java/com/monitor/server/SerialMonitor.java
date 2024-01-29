package com.monitor.server;
import java.net.MalformedURLException;
import com.fazecast.jSerialComm.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.net.URL;
import java.sql.*;

public class SerialMonitor {
    private boolean DEBUG=true;
    private URL url = new URL("http://localhost:8080");
    private SerialPort microbit;

    private static Connection connection;

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
        microbit = SerialPort.getCommPort("COM6");
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
                data =data.strip();
                System.out.println("INPUT:"+data);
                int packetType = Integer.parseInt(data.split(",")[0]);
                if (packetType == 1) { //moving device
                    String movDeviceName = data.split(",")[1];
                    String locName = data.split(",")[2];
                    System.out.println("OUTPUT:" + movDeviceName + "," + locName);
                } else if (packetType == 2) { //env
                    String locName = data.split(",")[1];
                    int temp = Integer.parseInt(data.split(",")[2]);
                    float light = Float.parseFloat(data.split(",")[3]);
                    int noise = Integer.parseInt(data.split(",")[4]);
                    System.out.println(locName + "," + temp + "," + light + "," + noise);
//                            try {
//                                //Insert data into the database
//                                PreparedStatement insertStatement = connection.prepareStatement(
//                                        "INSERT INTO roomEnvironment (temp, noise, light, time) VALUES (?, ?, ?, ?)"
//                                );
//                                insertStatement.setString(1, temp);
//                                insertStatement.setString(2, noise);
//                                insertStatement.setString(3, light);
//                                insertStatement.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
//                                insertStatement.executeUpdate();
//                            } catch (SQLException e) {
//                                e.printStackTrace();
//                            }

                }
                if (DEBUG) {

                }
            }
        });
    }
 
    public void stop(){
        microbit.closePort();
    }
}