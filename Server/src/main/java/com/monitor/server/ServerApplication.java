package com.monitor.server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.RestController;

import java.sql.*;
import java.time.LocalTime;

@EnableScheduling
@SpringBootApplication
@RestController
public class ServerApplication {
	private static final String PASSWORD = "";
	private static String URL = ""; //jdbc:mysql://localhost:3306/?useSSL=FALSE&allowPublicKeyRetrieval=True";
	private static final String USER = "";
	private static Connection connection;
	private static SerialMonitor monitor;
	public static LocalTime nextHour = LocalTime.now().plusHours(1);;
	private static boolean imAlive=false;

	//private static final String[] tableNames = {"zone1", "zone2", "zone3", "cup", "motion", "realTime"};
	/*private static final String[] tableQuery ={
		"temp VARCHAR(100) NOT NULL, noise VARCHAR(100) NOT NULL, light VARCHAR(100) NOT NULL, time INT",
			"temp VARCHAR(100) NOT NULL, noise VARCHAR(100) NOT NULL, light VARCHAR(100) NOT NULL, time INT",
			"temp VARCHAR(100) NOT NULL, noise VARCHAR(100) NOT NULL, light VARCHAR(100) NOT NULL, time INT",
			"timeOfUse timestamp",
			"item text NOT NULL, timeOfUse timestamp",
			"id INT, zone text NOT NULL, temp VARCHAR(100) NOT NULL, noise VARCHAR(100) NOT NULL, light VARCHAR(100) NOT NULL"
	};
	static {
		try {
			connection = DriverManager.getConnection(URL,USER,PASSWORD);
			Statement stmt = connection.createStatement();
			stmt.execute("CREATE DATABASE IF NOT EXISTS Microbits");
			URL = "jdbc:mysql://localhost:3306/Microbits?useSSL=FALSE&allowPublicKeyRetrieval=True";
			connection = DriverManager.getConnection(URL,USER,PASSWORD);
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}*/ //more database setup ^^
	public static void main(String[] args) throws Exception {
		/*
		String reset = "DROP TABLE IF EXISTS Microbits.Realtime ";
		PreparedStatement stmt2 = connection.prepareStatement(reset);
		stmt2.executeUpdate();
		for(int i=0;i<tableNames.length;i++){
			String make = "CREATE TABLE IF NOT EXISTS "+tableNames[i]+"("+tableQuery[i]+")";
			PreparedStatement stmt = connection.prepareStatement(make);
			stmt.executeUpdate();
		}
		*/ //database setup ^^
		SpringApplication.run(ServerApplication.class, args);
		monitor = new SerialMonitor();
		Thread.sleep(1000);
		try{
			monitor.start();
		}catch (Exception e) {
			System.out.println("no Microbit detected");
		}
	}
	@Scheduled(cron = "0 */2 * ? * *")
	private void cleanup(){
		System.out.println("cleaning up");
		monitor.stop();
		monitor=null;
		try{
			monitor= new SerialMonitor();
			monitor.start();
		}catch (Exception e){e.printStackTrace();}
	}
}
