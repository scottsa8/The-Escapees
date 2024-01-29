package com.monitor.server;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.boot.SpringApplication;
import java.time.LocalTime;
import java.sql.*;

@EnableScheduling
@SpringBootApplication
@RestController
public class ServerApplication {
	private static final String PASSWORD = "35c4p335!";
	private static String URL = "jdbc:mysql://localhost:3306/?useSSL=FALSE&allowPublicKeyRetrieval=True";
	private static final String USER = "java";
	private static Connection connection;
	private static SerialMonitor monitor;
	public static LocalTime nextHour = LocalTime.now().plusHours(1);;

	private static final String[] tableNames = {
		"users",
		"rooms",
		"roomOccupants",
		"roomEnvironment"
	};
	
	private static final String[] tableQuery ={
		"user_id INT PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, user_type VARCHAR(20) NOT NULL",
		"room_id INT PRIMARY KEY, room_name VARCHAR(255) NOT NULL, battery_level DECIMAL(5, 2), last_update_timestamp TIMESTAMP",
		"occupancy_id INT PRIMARY KEY, room_id INT NOT NULL, user_id INT NOT NULL, entry_timestamp TIMESTAMP, exit_timestamp TIMESTAMP, FOREIGN KEY (room_id) REFERENCES rooms(room_id), FOREIGN KEY (user_id) REFERENCES users(user_id)",
		"data_id INT PRIMARY KEY, room_id INT NOT NULL, timestamp TIMESTAMP, temperature DECIMAL(5, 2), noise_level DECIMAL(5, 2), light_level DECIMAL(5, 2), FOREIGN KEY (room_id) REFERENCES rooms(room_id)"
	};
	
	static {
		try {
			connection = DriverManager.getConnection(URL,USER,PASSWORD);
			Statement createDBStmt = connection.createStatement();
			createDBStmt.execute("CREATE DATABASE IF NOT EXISTS prisondb");
			URL = "jdbc:mysql://localhost:3306/prisondb?useSSL=FALSE&allowPublicKeyRetrieval=True";
			connection = DriverManager.getConnection(URL,USER,PASSWORD);

			for (int i = 0; i < tableNames.length; i++) {
				String make = "CREATE TABLE IF NOT EXISTS " + tableNames[i] + "(" + tableQuery[i] + ")";
				PreparedStatement createTableStmt = connection.prepareStatement(make);
				createTableStmt.executeUpdate();
			}
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	} //more database setup ^^
	public static void main(String[] args) throws Exception {
		SpringApplication.run(ServerApplication.class, args);

		monitor = new SerialMonitor(connection);
		Thread.sleep(1000);

		try{
			monitor.start();
		} catch (Exception e) {
			System.out.println("no Microbit detected");
		}
	}
	@Scheduled(cron = "0 */2 * ? * *")
	private void cleanup(){
		System.out.println("cleaning up");
		monitor.stop();
		monitor=null;
		try{
			monitor= new SerialMonitor(connection);
			monitor.start();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@GetMapping("/getAllNames")
	private String getAllNames(){
		String output="";
		//GET FROM DB
		return output;
	}
	@GetMapping("/getEnv")
	private String getEnv(@RequestParam(value = "loc") String loc){
		String output="";
		//GET FROM DB AT LOC
	return output;
	}

	@GetMapping("/getPeople")
	private int getPeople(@RequestParam(value="loc")String loc){
		int total=0;
		return total;
	}
	@GetMapping("/listAll")
	private String listAll(){
		String output="";
		//GET FROM DB
		//ALL PEOPLE AND LATEST LOCATION
		return output;
	}

	@GetMapping("/createAcc")
	private String createAcc(@RequestParam(value = "user") String user, @RequestParam(value="pass") String pass){
		//INSERT INTO DB
		return "created"; //else failed
	}
	@GetMapping("/checkLog")
	private boolean checkLog(@RequestParam(value = "user") String user, @RequestParam(value="pass") String pass){
		if(user.equals(user) && pass.equals(pass)){//FROM DB
			return true;
		}else{
			return false;
		}
	}
}
