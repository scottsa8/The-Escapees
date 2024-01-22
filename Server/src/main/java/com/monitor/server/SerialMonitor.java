package com.monitor.server;

import com.fazecast.jSerialComm.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalTime;

public class SerialMonitor {
    private boolean DEBUG=true;
    private URL url = new URL("http://localhost:8080");
    private LocalTime hour = LocalTime.now();
    private LocalTime nextHour;
    private SerialPort microbit;

    public SerialMonitor() throws MalformedURLException {}
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
                //  *do something with data*
            }
        });
    }
    public void stop(){
        microbit.closePort();
    }
}