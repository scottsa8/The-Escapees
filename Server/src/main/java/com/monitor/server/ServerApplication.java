package com.monitor.server;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.core.io.InputStreamResource;
import org.springframework.boot.SpringApplication;
import org.springframework.web.bind.annotation.*;
import java.net.MalformedURLException;
import java.text.SimpleDateFormat;
import org.springframework.http.*;
import org.mindrot.jbcrypt.BCrypt;
import java.io.FileInputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Guard;
import java.util.ArrayList;
import java.util.List;
import java.sql.*;

@EnableScheduling
@SpringBootApplication
@RestController
@CrossOrigin(origins = "*")
public class ServerApplication {
	private static final String PASSWORD = "35c4p335!";
	private static String URL = "jdbc:mysql://localhost:3306/?useSSL=FALSE&allowPublicKeyRetrieval=True";
	private static final String USER = "java";
	private static Connection connection;
	private static SerialMonitor monitor;
	private static String domain = "Prison"; // default domain

	private static final String[] tableNames = {
		"users",
		"rooms",
		"roomOccupants",
		"roomEnvironment",
		"headCountHistory",
		"doors",
    	"doorHistory"
	};

	private static final String[] tableQuery = {
		"user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, user_type VARCHAR(20) NOT NULL, user_microbit VARCHAR(10) UNIQUE",
		"room_id INT AUTO_INCREMENT PRIMARY KEY, room_name VARCHAR(255) UNIQUE NOT NULL, room_microbit VARCHAR(10) UNIQUE, top_left_x INT NOT NULL, top_left_y INT NOT NULL, bottom_right_x INT NOT NULL, bottom_right_y INT NOT NULL, max_temperature DECIMAL(5, 2), max_noise_level DECIMAL(5, 2), max_light_level DECIMAL(8, 2)",
		"occupancy_id INT AUTO_INCREMENT PRIMARY KEY, room_id INT NOT NULL, user_id INT NOT NULL, entry_timestamp TIMESTAMP, FOREIGN KEY (room_id) REFERENCES rooms(room_id), FOREIGN KEY (user_id) REFERENCES users(user_id)",
		"data_id INT AUTO_INCREMENT PRIMARY KEY, room_id INT NOT NULL, timestamp TIMESTAMP, temperature DECIMAL(5, 2), noise_level DECIMAL(5, 2), light_level DECIMAL(8, 2), FOREIGN KEY (room_id) REFERENCES rooms(room_id)",
		"history_id INT AUTO_INCREMENT PRIMARY KEY, room_id INT NOT NULL, head_count INT NOT NULL, change_timestamp TIMESTAMP NOT NULL, FOREIGN KEY (room_id) REFERENCES rooms(room_id)",
		"door_id INT AUTO_INCREMENT PRIMARY KEY, room_id INT NOT NULL, door_name VARCHAR(255) UNIQUE NOT NULL, x_coordinate INT NOT NULL, y_coordinate INT NOT NULL, FOREIGN KEY (room_id) REFERENCES rooms(room_id)",
    	"doorHistory_id INT AUTO_INCREMENT PRIMARY KEY, door_id INT NOT NULL, is_locked BOOLEAN NOT NULL, change_timestamp TIMESTAMP NOT NULL, FOREIGN KEY (door_id) REFERENCES doors(door_id)"
	};	
	
	public static void main(String[] args) throws Exception {
		SpringApplication.run(ServerApplication.class, args);
		ServerApplication serverApp = new ServerApplication();
		serverApp.initialize();
		serverApp.startSerialMonitor();
	}

	private void initialize() {
		try {
			connection = DriverManager.getConnection(URL, USER, PASSWORD);
			Statement createDBStmt = connection.createStatement();
			createDBStmt.execute("CREATE DATABASE IF NOT EXISTS " + domain + "db");
			URL = "jdbc:mysql://localhost:3306/" + domain + "db?useSSL=FALSE&allowPublicKeyRetrieval=True";
			connection = DriverManager.getConnection(URL, USER, PASSWORD);

			for (int i = 0; i < tableNames.length; i++) {
				String make = "CREATE TABLE IF NOT EXISTS " + tableNames[i] + "(" + tableQuery[i] + ")";
				PreparedStatement createTableStmt = connection.prepareStatement(make);
				createTableStmt.executeUpdate();
			}
		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}


	@GetMapping("/getDomain")
	public static String getDomain() {
		return domain;
	}

	private void startSerialMonitor() throws MalformedURLException {
		monitor = new SerialMonitor(connection);
		try {
			monitor.start();
		} catch (Exception e) {
			System.out.println("no Microbit detected");
		}
		// transmitMessage(1, "Hello testing sending a long message with a variety of different stuff in the message so that I know what is going on with the thing im working on");
		// transmitMessage(1, "Message");
	}

	@Scheduled(cron = "0 */2 * ? * *")
	private void cleanup() {
		System.gc();
		System.out.println("cleaning up");
		 monitor.stop();
		 monitor=null;
		 try{
		 monitor= new SerialMonitor(connection);
		 monitor.start();
		 } catch (Exception e) {
		 //e.printStackTrace();
		 }
	}


	@GetMapping("/getDomains")
	private String getDomains() {
		StringBuilder output = new StringBuilder();
		output.append("[");
		try {
			PreparedStatement selectDatabasesStatement = connection.prepareStatement(
					"SHOW DATABASES LIKE '%db'");
			ResultSet rs = selectDatabasesStatement.executeQuery();
			while (rs.next()) {
				String dbname = rs.getString(1).substring(0, rs.getString(1).length() - 2);
				output.append("\"" + dbname + "\",");
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		output.deleteCharAt(output.length() - 1);
		output.append("]");
		return output.toString();
	}
	@GetMapping("/getTypes")
	public ArrayList<String> getTypes(){
		try{
			PreparedStatement stmt = connection.prepareStatement("SELECT DISTINCT user_type FROM users");
			ResultSet rs = stmt.executeQuery();
			if(rs.next()){
				ArrayList<String> output = new ArrayList<>();
				while (rs.next()){
					output.add(rs.getString("user_type"));
				}
				return output;
			}
		}catch (Exception e){
			e.printStackTrace();
		return null;
		}
	return null;
	}

	@GetMapping("/setDomain")
	public boolean setDomain(@RequestParam(value = "domain") String d) {
		String temp = domain;
		try {
			domain = d;
			initialize();
			return true;
		} catch (Exception e) {
			domain = temp;
			return false;
		}
	}

	@GetMapping("/setupMap")
	private boolean setupMap(
			@RequestParam(value = "roomName") String roomName,
			@RequestParam(value = "points") int[] points) {
		// Check if the 'points' array has exactly four elements (x1, y1, x2, y2)
		if (points.length != 4) {
			return false; // Invalid input
		}
		int rowsAffected;
		try {
			PreparedStatement stmt = connection.prepareStatement("SELECT room_name FROM rooms WHERE room_name = ?");
			stmt.setString(1,roomName);
			ResultSet rs = stmt.executeQuery();

			if(rs.next()){
				// update room
				// Function only requires top left and bottom right coordinate of the room to work out all 4 coordinates
				PreparedStatement insertRoomStatement = connection.prepareStatement(
						"UPDATE rooms SET top_left_x=?, top_left_y=?, bottom_right_x=?, bottom_right_y=? " +
								"WHERE room_name = ?"
				);

				// Set parameters

				insertRoomStatement.setInt(1, points[0]); // top_left_x
				insertRoomStatement.setInt(2, points[1]); // top_left_y
				insertRoomStatement.setInt(3, points[2]); // bottom_right_x
				insertRoomStatement.setInt(4, points[3]); // bottom_right_y
				insertRoomStatement.setString(5, roomName);
				// Execute the insert statement
				rowsAffected = insertRoomStatement.executeUpdate();
			}else{
				// create new room
				// Function only requires top left and bottom right coordinate of the room to work out all 4 coordinates
				PreparedStatement insertRoomStatement = connection.prepareStatement(
						"INSERT INTO rooms (room_name, top_left_x, top_left_y, bottom_right_x, bottom_right_y) " +
								"VALUES (?, ?, ?, ?, ?)"
				);
				// Set parameters
				insertRoomStatement.setString(1, roomName);
				insertRoomStatement.setInt(2, points[0]); // top_left_x
				insertRoomStatement.setInt(3, points[1]); // top_left_y
				insertRoomStatement.setInt(4, points[2]); // bottom_right_x
				insertRoomStatement.setInt(5, points[3]); // bottom_right_y

				// Execute the insert statement
				rowsAffected = insertRoomStatement.executeUpdate();
			}

	
			// Check if the insertion was successful (1 row affected)
			return rowsAffected == 1;
	
		} catch (SQLException e) {
			e.printStackTrace(); // Handle the SQL exception appropriately
			return false;
		}
	}

	@GetMapping("/setupDoors")
	private boolean setupDoors(
			@RequestParam(value = "roomName") String roomName,
			@RequestParam(value = "doorName") String doorName,
			@RequestParam(value = "xCoordinate") int xCoordinate,
			@RequestParam(value = "yCoordinate") int yCoordinate) {
		try {
			// Fetch the room_id based on the roomName
			PreparedStatement selectRoomIdStatement = connection.prepareStatement(
					"SELECT room_id FROM rooms WHERE room_name = ?"
			);
			selectRoomIdStatement.setString(1, roomName);
			ResultSet roomResultSet = selectRoomIdStatement.executeQuery();
	
			if (roomResultSet.next()) {
				// Retrieve the room_id
				int roomId = roomResultSet.getInt("room_id");

				PreparedStatement checkDoor = connection.prepareStatement(
						"SELECT door_name FROM doors WHERE door_name = ?"
				);
				checkDoor.setString(1, doorName);
				checkDoor.executeQuery();
				ResultSet doorResult = selectRoomIdStatement.executeQuery();

				if(doorResult.next()){
					PreparedStatement insertDoorStatement = connection.prepareStatement(
							"UPDATE doors SET x_coordinate=?, y_coordinate=? " +
									"WHERE door_name = ?"
					);
					insertDoorStatement.setInt(1, xCoordinate);
					insertDoorStatement.setInt(2, yCoordinate);
					insertDoorStatement.setString(3, doorName);
					insertDoorStatement.executeUpdate();

					return true;
				}else {

					// Insert the new door into the database
					PreparedStatement insertDoorStatement = connection.prepareStatement(
							"INSERT INTO doors (room_id, door_name, x_coordinate, y_coordinate) " +
									"VALUES (?, ?, ?, ?)"
					);
					insertDoorStatement.setInt(1, roomId);
					insertDoorStatement.setString(2, doorName);
					insertDoorStatement.setInt(3, xCoordinate);
					insertDoorStatement.setInt(4, yCoordinate);
					insertDoorStatement.executeUpdate();

					return true;
				}
			} else {
				// Handle the case when the roomName is not found
				return false;
			}
		} catch (Exception e) {
			e.printStackTrace();
			// Handle the exception
			return false;
		}
	}
	

	@GetMapping("/getDoors")
	private String getDoors(@RequestParam(value = "roomName") String roomName) {
		StringBuilder output = new StringBuilder();
		output.append("{\"doors\":{" +
				"\"data\":[");

		try {
			// Retrieve all doors for the given room from the database
			PreparedStatement selectDoorsStatement = connection.prepareStatement(
					"SELECT door_name FROM doors WHERE room_id = (SELECT room_id FROM rooms WHERE room_name = ?)");
			selectDoorsStatement.setString(1, roomName);
			ResultSet rs = selectDoorsStatement.executeQuery();

			// Iterate over the result set and build the output string
			while (rs.next()) {
				output.append("{\"door\": \"" + rs.getString("door_name") + "\"}");
				if (!rs.isLast()) {
					output.append(",");
				}
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		output.append("]}}");
		return output.toString();
	}

	@GetMapping("/panic")
	private String triggerPanic() {
		if (monitor != null) {
			monitor.panic();
			return "Panic function triggered successfully";
		} else {
			return "Microbit not available";
		}
	}

	@GetMapping("/getAllNames")
	private String getAllNames() {
		StringBuilder output = new StringBuilder();
		output.append("{\"names\":{" +
				"\"data\":[");
		try {
			Statement stmt = connection.createStatement();
			ResultSet rs = stmt.executeQuery("SELECT username,user_microbit FROM users");
			while (rs.next()) {
				output.append("{\"username\": \"" + rs.getString("username") + "\", \"microbit\": \""+rs.getString("user_microbit")+"\"}");
				if (!rs.isLast()) {
					output.append(",");
				}
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}
		output.append("]}}");
		return output.toString();
	}

	@GetMapping("/getTracked")
	private String getTracked() {
		StringBuilder output = new StringBuilder();
		output.append("{\"names\":{" +
				"\"data\":[");
		try {
			Statement stmt = connection.createStatement();
			ResultSet rs = stmt
					.executeQuery("SELECT username,user_microbit FROM users WHERE user_microbit IS NOT NULL AND user_microbit != \"\"");
			while (rs.next()) {
				output.append("{\"username\": \"" + rs.getString("username") + "\", \"microbit\": \""+rs.getString("user_microbit")+"\"}");
				if (!rs.isLast()) {
					output.append(",");
				}
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}
		output.append("]}}");
		return output.toString();
	}

	@RequestMapping(value = "/getEnv", produces = MediaType.APPLICATION_JSON_VALUE)
	private String getEnv(@RequestParam(value = "loc") String loc, @RequestParam(value = "order") String order) {
		StringBuilder output = new StringBuilder();
		output.append("{\"environment\":{\"data\":[");
		try {
			// Get room_id from rooms table using the room name (loc)
			PreparedStatement roomIdStatement = connection.prepareStatement(
					"SELECT room_id FROM rooms WHERE room_name = ?");
			roomIdStatement.setString(1, loc);

			ResultSet roomIdResultSet = roomIdStatement.executeQuery();

			if (roomIdResultSet.next()) {
				int roomId = roomIdResultSet.getInt("room_id");
				ResultSet rs;
				if (order.equals("DESC")) {
					// Fetch records from roomEnvironment using the obtained room_id
					PreparedStatement selectStatement = connection.prepareStatement(
							"SELECT * FROM roomEnvironment WHERE room_id = ? ORDER BY timestamp DESC");
					selectStatement.setInt(1, roomId);
					rs = selectStatement.executeQuery();
				} else {
					// Fetch records from roomEnvironment using the obtained room_id
					PreparedStatement selectStatement = connection.prepareStatement(
							"SELECT * FROM roomEnvironment WHERE room_id = ? ORDER BY timestamp ASC");
					selectStatement.setInt(1, roomId);
					rs = selectStatement.executeQuery();
				}

				while (rs.next()) {
					int dataId = rs.getInt("data_id");
					Timestamp timestamp = rs.getTimestamp("timestamp");
					BigDecimal temperature = rs.getBigDecimal("temperature");
					BigDecimal noiseLevel = rs.getBigDecimal("noise_level");
					BigDecimal lightLevel = rs.getBigDecimal("light_level");

					// Customize the output format based on your needs
					output.append("{\"DataID\": \"" + dataId + "\", \"Timestamp\": \"" + timestamp.toString()
							+ "\", \"Temperature\": \"" + temperature.toString() + "\", \"NoiseLevel\": \""
							+ noiseLevel.toString() + "\", \"LightLevel\": \"" + lightLevel.toString() + "\"}");
					if (!rs.isLast()) {
						output.append(",");
					}
				}
			} else {
				// Handle the case when the room name (loc) is not found
				output.append("{\"error\": \"Room not found\"}");
			}

		} catch (SQLException e) {
			e.printStackTrace();
			// Handle the SQL exception
			output.append("{\"error\": \"An error occurred\"}");
		}
		output.append("]}}");
		return output.toString();
	}

	@GetMapping("/genReport")
	private ResponseEntity<InputStreamResource> getReport(@RequestParam(value = "day") String day) {
		// format date correctly
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
		try {
			// create a new thread to generate the report
			Runnable r = new pdfWriter(connection, new Date(formatter.parse(day).getTime()));
			Thread thread = new Thread(r);
			thread.start();
			while (thread.isAlive()) { // wait for report to be generated
				try {
					thread.join();
				} catch (Exception e) {
					wait(100);
				}
			}
			try {
				// turn the pdf into a response entity to be returned through HTTP request
				FileInputStream fileInputStream = new FileInputStream("src/main/resources/report.pdf");
				InputStreamResource inputStreamResource = new InputStreamResource(fileInputStream);
				HttpHeaders headers = new HttpHeaders();
				headers.setContentLength(Files.size(Paths.get("src/main/resources/report.pdf")));
				headers.setContentType(MediaType.APPLICATION_PDF);
				return new ResponseEntity<>(inputStreamResource, headers, HttpStatus.OK);
			} catch (Exception e) {
				e.printStackTrace();
			}
		} catch (Exception e) {
			System.out.println("failed to generate report");
		}
		return null;
	}

	@GetMapping("/getPeople")
	private int getPeople(@RequestParam(value = "loc") String loc,
						  @RequestParam(value = "type") String type) {
		int total = 0;
	
		try (PreparedStatement selectStatement = connection.prepareStatement(
//				"SELECT COUNT(DISTINCT ro.user_id) AS total_people " +
//						"FROM roomOccupants ro " +
//						"JOIN (SELECT user_id, MAX(entry_timestamp) AS max_timestamp " +
//						"      FROM roomOccupants " +
//						"      GROUP BY user_id) latest ON ro.user_id = latest.user_id " +
//						"JOIN rooms r ON ro.room_id = r.room_id " +
//						"JOIN users u ON ro.user_id = u.user_id " +
//						"WHERE r.room_name = ? " +
//						"AND ro.entry_timestamp = latest.max_timestamp " +
//						"AND u.user_type = ?"))
		"")	)			{
			selectStatement.setString(1, loc);
			selectStatement.setString(2, type);
	
			try (ResultSet rs = selectStatement.executeQuery()) {
				// Retrieve the total count
				if (rs.next()) {
					total = rs.getInt("total_people");
				}
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	
		return total;
	}
	
	
	

	@GetMapping("/getRooms")
	private String getRooms() {
		StringBuilder output = new StringBuilder();
		output.append("{\"rooms\":{" +
				"\"data\":[");
		try {
			// Fetch all rooms from the database
			PreparedStatement selectStatement = connection.prepareStatement("SELECT * FROM rooms");
			ResultSet rs = selectStatement.executeQuery();
			// Iterate over the result set and build the output string
			while (rs.next()) {
				output.append("{\"room\": \"" + rs.getString("room_name") + "\"}");
				if (!rs.isLast()) {
					output.append(",");
				}
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		output.append("]}}");
		return output.toString();
	}

	@GetMapping("/listAll")
	private String listAll(@RequestParam(value = "user", defaultValue = "all") String user,
			@RequestParam(value = "RT", required = false) boolean RT) {
		StringBuilder output = new StringBuilder();
		output.append("{\"locations\":{" +
				"\"data\":[");
		try {
			PreparedStatement selectStatement;
			if (user.equals("all")) {
				selectStatement = connection.prepareStatement(
						"SELECT u.username, r.room_name, ro.entry_timestamp " +
								"FROM users u " +
								"JOIN roomoccupants ro ON u.user_id = ro.user_id " +
								"JOIN rooms r ON ro.room_id = r.room_id");
			} else {
				if (RT) {
					selectStatement = connection.prepareStatement(
							"SELECT u.username, r.room_name, ro.entry_timestamp " +
									"FROM users u " +
									"JOIN roomoccupants ro ON u.user_id = ro.user_id " +
									"JOIN rooms r ON ro.room_id = r.room_id " +
									"WHERE u.username = \"" + user + "\" " +
									"ORDER BY ro.entry_timestamp DESC LIMIT 1");
				} else {
					selectStatement = connection.prepareStatement(
							"SELECT u.username, r.room_name, ro.entry_timestamp " +
									"FROM users u " +
									"JOIN roomoccupants ro ON u.user_id = ro.user_id " +
									"JOIN rooms r ON ro.room_id = r.room_id " +
									"WHERE u.username = \"" + user + "\"");
				}
			}
			// Fetch all users and their latest location from the database

			ResultSet rs = selectStatement.executeQuery();

			// Iterate over the result set and build the output string
			while (rs.next()) {
				String username = rs.getString("username");
				String roomName = rs.getString("room_name");
				Timestamp timestamp = rs.getTimestamp("entry_timestamp");

				// output.append("Location: ").append(roomName).append("!");
				output.append("{\"user\": \"" + username + "\", \"Location\": \"" + roomName + "\", \"Timestamp\": \""
						+ timestamp.toString() + "\"}");
				if (!rs.isLast()) {
					output.append(",");
				}
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}
		output.append("]}}");
		return output.toString();
	}

	@GetMapping("/createAcc")
	private boolean createAcc(@RequestParam(value = "user") String user, @RequestParam(value = "pass") String pass,
			@RequestParam(value = "type") String type) {
		try {
			PreparedStatement insertStatement = connection.prepareStatement(
					"INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)");
			insertStatement.setString(1, user);
			insertStatement.setString(2, hashPassword(pass));
			if (type == null) {
				insertStatement.setString(3, "user"); // Assuming default user_type is "user"
			} else {
				insertStatement.setString(3, type);
			}

			insertStatement.executeUpdate();
			return true; // Success
		} catch (SQLException e) {
			e.printStackTrace();
			return false; // Failed
		}
	}

	@GetMapping("/checkLog")
	private boolean checkLog(@RequestParam(value = "user") String user, @RequestParam(value = "pass") String pass) {
		try {
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT * FROM users WHERE username = ?");
			selectStatement.setString(1, user);
			ResultSet rs = selectStatement.executeQuery();
			if (rs.next()) {
				String storedHashedPassword = rs.getString("password");

				// Use the verifyPassword function to check if the provided password is correct
				if (verifyPassword(pass, storedHashedPassword)) {
					System.out.println("Password verification successful.");
					return true; // Password is correct
				} else {
					System.out.println("Incorrect password.");
					return false; // Password is incorrect
				}
			} else {
				System.out.println("User not found.");
				return false; // User not found
			}
		} catch (SQLException e) {
			e.printStackTrace();
			return false; // Failed
		}
	}

	@GetMapping("/getUserType")
	private String getUserType(@RequestParam(value = "user") String user) {
		String type = "";
		try {
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT user_type FROM users WHERE username = ?");
			selectStatement.setString(1, user);
			ResultSet rs = selectStatement.executeQuery();
			if (rs.next()) {
				type = rs.getString("user_type");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return type;
	}
	@GetMapping("/getRoomInfo")
	private String getRoomInfo(){
		StringBuilder output = new StringBuilder();
		output.append("{\"rooms\":{" +
				"\"data\":[");
		try{
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT * FROM rooms");
			ResultSet rs = selectStatement.executeQuery();
			while(rs.next()){
				output.append("{\"name\": \""+rs.getString("room_name")+"\", " +
						"\"microbit\": \""+rs.getString("room_microbit")+"\", "+
						"\"maxTemp\": \""+rs.getInt("max_temperature")+"\", "+
						"\"maxNoise\": \""+rs.getInt("max_noise_level")+"\", "+
						"\"maxLight\": \""+rs.getInt("max_light_level")+"\"}");
				if(!rs.isLast()){
					output.append(",");
				}
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		output.append("]}}");
		return output.toString();
	}
	@GetMapping("/updateMB")
	private boolean setup(@RequestParam(value = "type") String type, @RequestParam(value = "name") String name,
			@RequestParam(value = "microbit") String mbName,
			@RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite) {
		try {
			String storedName = "";
			if (type.equals("room")) {
				PreparedStatement selectStatement = connection.prepareStatement(
						"SELECT room_microbit FROM rooms WHERE room_name = ?");
				selectStatement.setString(1, name);
				ResultSet rs = selectStatement.executeQuery();
				if (rs.next()) {
					storedName = rs.getString("room_microbit");
				}else{
					storedName="";
				}
				if (storedName==null|| overwrite) {
					PreparedStatement insertStatement = connection.prepareStatement(
							"UPDATE rooms SET room_microbit = ? WHERE room_name = ?");
					insertStatement.setString(1, mbName);
					insertStatement.setString(2, name);
					insertStatement.executeUpdate();
					return true;
				} else {
					return false;
				}
			} else if (type.equals("user")) {
				PreparedStatement selectStatement = connection.prepareStatement(
						"SELECT user_microbit FROM users WHERE username = ?");
				selectStatement.setString(1, name);
				ResultSet rs = selectStatement.executeQuery();
				if (rs.next()) {
					storedName = rs.getString("user_microbit");
				}else{
					storedName="";
				}
				if (storedName==null || overwrite) {
					PreparedStatement insertStatement = connection.prepareStatement(
							"UPDATE users SET user_microbit = ? WHERE username = ?");
					insertStatement.setString(1, mbName);
					insertStatement.setString(2, name);
					insertStatement.executeUpdate();
					return true;
				} else {
					return false;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}
	@GetMapping("/addNode")
	private boolean addNode(@RequestParam(value="roomName")String roomName,@RequestParam(value="mb") String mb,
							@RequestParam(value="maxes") int[] max){
		//check it doesn't exist first
		try{
			PreparedStatement findRoom = connection.prepareStatement(
					"SELECT room_name FROM rooms WHERE room_name = ?"
			);
			findRoom.setString(1,roomName);
			ResultSet rs= findRoom.executeQuery();
			if(!rs.next()){
				PreparedStatement createRoom = connection.prepareStatement(
						"INSERT INTO rooms (room_name, room_microbit, top_left_x, top_left_y, bottom_right_x, bottom_right_y, " +
								"max_temperature, max_noise_level, max_light_level) " +
								"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
				);
				createRoom.setString(1,roomName);
				createRoom.setString(2,mb);
				createRoom.setInt(3,0);
				createRoom.setInt(4,0);
				createRoom.setInt(5,0);
				createRoom.setInt(6,0);
				createRoom.setInt(7,max[0]);
				createRoom.setInt(8,max[1]);
				createRoom.setInt(9,max[2]);
				createRoom.executeUpdate();
				return true;
			}else{
				return false;
			}

		} catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	@GetMapping("/updateMax")
	private boolean updateMax(@RequestParam(value="roomName") String roomName,@RequestParam(value="max") int[] maxes){
		try{
			PreparedStatement update = connection.prepareStatement(
					"UPDATE rooms SET max_temperature=?, max_noise_level=?, max_light_level=? WHERE room_name=?"
			);
			update.setInt(1,maxes[0]);
			update.setInt(2,maxes[1]);
			update.setInt(3,maxes[2]);
			update.setString(4,roomName);
			update.executeUpdate();
			return true;
		} catch (SQLException e) {
			e.printStackTrace();
			return false;

		}

	}
	@GetMapping("/isDoorLocked")
	private boolean isDoorLocked(@RequestParam(value = "doorName") String doorName) {
		try {
			// Fetch the most recent status for the given door from the database
			PreparedStatement selectDoorStatusStatement = connection.prepareStatement(
					"SELECT is_locked FROM doorHistory " +
					"JOIN doors ON doorHistory.door_id = doors.door_id " +
							"WHERE doors.door_name = ? " +
							"ORDER BY change_timestamp DESC " +
							"LIMIT 1"
							);
							// Set the doorName parameter in the SQL query
							selectDoorStatusStatement.setString(1, doorName);
							// Execute the query and get the result set
							ResultSet rs = selectDoorStatusStatement.executeQuery();
							
			if (rs.next()) {
				// Retrieve the status from the result set and return it
				if(rs.getInt("is_locked")==1){
					return true;
				}else{
					return false;
				}
			} else {
				// Handle the case when the door name is not found
				return true;
			}

		} catch (SQLException e) {
			e.printStackTrace();
			// Handle the SQL exception
			return false;
		}
	}

	@GetMapping("/getRoomCoordinates")
	private String getRoomCoordinates(@RequestParam(value = "roomName") String roomName) {
		StringBuilder coordinates = new StringBuilder();
		coordinates.append("{\"coords\":{" +
				"\"data\":[");
		try {
			// Fetch all coordinates for the given room from the database
			PreparedStatement selectCoordinatesStatement = connection.prepareStatement(
					"SELECT top_left_x, top_left_y, bottom_right_x, bottom_right_y FROM rooms WHERE room_name = ?"
			);
			selectCoordinatesStatement.setString(1, roomName);
			ResultSet rs = selectCoordinatesStatement.executeQuery();
			if (rs.next()) {
				// Retrieve coordinates and append them to the StringBuilder
				int topLeftX = rs.getInt("top_left_x");
				int topLeftY = rs.getInt("top_left_y");
				int bottomRightX = rs.getInt("bottom_right_x");
				int bottomRightY = rs.getInt("bottom_right_y");

				coordinates.append(topLeftX).append(",").append(topLeftY).append(",")
						.append(bottomRightX).append(",").append(topLeftY).append(",")
						.append(bottomRightX).append(",").append(bottomRightY).append(",")
						.append(topLeftX).append(",").append(bottomRightY);

			} else {
				// Handle the case when the room name is not found
				coordinates.append("Room not found");
			}
		} catch (SQLException e) {
			e.printStackTrace();
			// Handle the SQL exception
			coordinates.append("An error occurred");
		}
		coordinates.append("]}}");
		return coordinates.toString();
	}

	@GetMapping("/getAllRoomData")
	private String getAllRoomData() {
		StringBuilder roomData = new StringBuilder();
		roomData.append("{\"rooms\":{" +
				"\"data\":[");
		try {
			// Fetch all room data from the database
			PreparedStatement selectRoomDataStatement = connection.prepareStatement(
					"SELECT room_id, room_name, " +
							"top_left_x, top_left_y, bottom_right_x, bottom_right_y " +
							"FROM rooms"
			);
			ResultSet rs = selectRoomDataStatement.executeQuery();
	
			while (rs.next()) {
				// Retrieve room data and append them to the StringBuilder
				int roomId = rs.getInt("room_id");
				String roomName = rs.getString("room_name");
				int roomTopLeftX = rs.getInt("top_left_x");
				int roomTopLeftY = rs.getInt("top_left_y");
				int roomBottomRightX = rs.getInt("bottom_right_x");
				int roomBottomRightY = rs.getInt("bottom_right_y");
	
				roomData.append("{\"Name\": \"").append(roomName).append("\",")
						.append("\"TLC\": \"").append(roomTopLeftX).append(",").append(roomTopLeftY).append("\",")
						.append("\"TRC\": \"").append(roomBottomRightX).append(",").append(roomTopLeftY).append("\",")
						.append("\"BLC\": \"").append(roomTopLeftX).append(",").append(roomBottomRightY).append("\",")
						.append("\"BRC\": \"").append(roomBottomRightX).append(",").append(roomBottomRightY).append("\"}");
				if(!rs.isLast()){
					roomData.append(",");
				}
			}
	
			if (roomData.length() == 0) {
				// Handle the case when there are no rooms
				roomData.append("{\"error\": \"no rooms\"}");
			}
	
		} catch (SQLException e) {
			e.printStackTrace();
			// Handle the SQL exception
			roomData.append("{\"error\": \"SQL error\"}");
		}
		roomData.append("]}}");
		return roomData.toString();
	}	

	@GetMapping("/getAllDoorData")
	private String getAllDoorData(@RequestParam (value="room") String roomName) {
		StringBuilder doorData = new StringBuilder();
		doorData.append("{\"doors\":{" +
				"\"data\":[");
		try {
			// Fetch all door data from the database without returning door_id and room_id
			PreparedStatement selectDoorDataStatement = connection.prepareStatement(
					"SELECT door_name, x_coordinate, y_coordinate FROM doors "+
					"JOIN rooms ON doors.room_id = rooms.room_id WHERE rooms.room_name= ?"

			);
			selectDoorDataStatement.setString(1,roomName);
			ResultSet rs = selectDoorDataStatement.executeQuery();
			while (rs.next()) {
				// Retrieve door data and append them to the StringBuilder
				String doorName = rs.getString("door_name");
				int xCoordinate = rs.getInt("x_coordinate");
				int yCoordinate = rs.getInt("y_coordinate");

				doorData.append("{\"Name\": \"").append(doorName).append("\",")
						.append("\"coords\": \"").append(xCoordinate).append(",").append(yCoordinate).append("\"}");
				if(!rs.isLast()){
					doorData.append(",");
				}
			}

			if (doorData.length() == 0) {
				// Handle the case when there are no doors
				doorData.append("{\"error\": \"no doors\"}");
			}

		} catch (SQLException e) {
			e.printStackTrace();
			// Handle the SQL exception
			doorData.append("{\"error\": \"SQL error\"}");
		}
		doorData.append("]}}");
		return doorData.toString();
	}

	@GetMapping("/transmitMessage")
	private String transmitMessage(
			@RequestParam(value = "username") String personId,
			@RequestParam(value = "message") String message) {

		try {
			// Retrieve the microbit linked to the person from the database
			String microbitName = getMicrobitForPerson(personId);

			if (microbitName != null) {
				// Transmit the message to the microbit over serial
				// Will remove "/EOM/" and commas from the message as "/EOM/" will
				// signify the end of the message for the microbit
				String sanitizedMessage = message.replace(",", "");

				if (monitor != null) {
					monitor.sendMessage(microbitName, sanitizedMessage);
					return "Message transmitted successfully";
				} else {
					return "Microbit not available";
				}
			} else {
				return "Microbit not found for person ID: " + personId;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "Failed to transmit message";
		}
	}

	@GetMapping("/transmitMessageBatch")
	private String transmitMessageBatch(
			@RequestParam(value = "userType") String userType,
			@RequestParam(value = "message") String message) {

		try {
			// Retrieve the microbits linked to users of the specified user type from the
			// database
			List<String> microbitNames = getMicrobitsForUserType(userType);

			if (!microbitNames.isEmpty()) {
				// Construct the message with user type at the start and send to each microbit
				if (monitor != null) {
					for (String microbitName : microbitNames) {
						String fullMessage = userType + ":" + microbitName + "," + message;
						// monitor.sendMessage(fullMessage);
					}
					return "Messages transmitted successfully";
				} else {
					return "Microbit not available";
				}
			} else {
				return "No microbits found for user type: " + userType;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "Failed to transmit messages";
		}
	}

	private String getMicrobitForPerson(String username) throws SQLException {
		// Retrieve the microbit linked to the person from the database
		String microbitName = null;
		try {
			PreparedStatement selectMicrobitStatement = connection.prepareStatement(
					"SELECT user_microbit FROM users WHERE username = ?");
			selectMicrobitStatement.setString(1, username);
			ResultSet microbitResult = selectMicrobitStatement.executeQuery();

			if (microbitResult.next()) {
				microbitName = microbitResult.getString("user_microbit");
			}
		} catch (SQLException e) {
			e.printStackTrace();
			throw e;
		}
		return microbitName;
	}

	private List<String> getMicrobitsForUserType(String userType) throws SQLException {
		// Retrieve the microbits linked to users of the specified user type from the
		// database
		List<String> microbitNames = new ArrayList<>();
		try {
			PreparedStatement selectMicrobitsStatement = connection.prepareStatement(
					"SELECT user_microbit FROM users WHERE user_type = ?");
			selectMicrobitsStatement.setString(1, userType);
			ResultSet microbitResult = selectMicrobitsStatement.executeQuery();

			while (microbitResult.next()) {
				microbitNames.add(microbitResult.getString("user_microbit"));
			}
		} catch (SQLException e) {
			e.printStackTrace();
			throw e;
		}
		return microbitNames;
	}

	public static String hashPassword(String plainPassword) {
		// Adjust the log rounds to change security (larger number takes longer but more
		// secure)
		return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
	}

	public static boolean verifyPassword(String plainPassword, String hashedPassword) {
		return BCrypt.checkpw(plainPassword, hashedPassword);
	}
}
