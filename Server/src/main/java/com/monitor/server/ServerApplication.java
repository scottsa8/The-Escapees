package com.monitor.server;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.boot.SpringApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.mindrot.jbcrypt.BCrypt;
import java.math.BigDecimal;
import java.sql.*;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.net.MalformedURLException;


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

	private static final String[] tableNames = {
		"users",
		"rooms",
		"roomOccupants",
		"roomEnvironment",
		"headCountHistory"
	};
	
	private static final String[] tableQuery = {
		"user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, user_type VARCHAR(20) NOT NULL, user_microbit VARCHAR(10) UNIQUE",
		"room_id INT AUTO_INCREMENT PRIMARY KEY, room_name VARCHAR(255) NOT NULL, room_microbit VARCHAR(10) UNIQUE",
		"occupancy_id INT AUTO_INCREMENT PRIMARY KEY, room_id INT NOT NULL, user_id INT NOT NULL, entry_timestamp TIMESTAMP, FOREIGN KEY (room_id) REFERENCES rooms(room_id), FOREIGN KEY (user_id) REFERENCES users(user_id)",
		"data_id INT AUTO_INCREMENT PRIMARY KEY, room_id INT NOT NULL, timestamp TIMESTAMP, temperature DECIMAL(5, 2), noise_level DECIMAL(5, 2), light_level DECIMAL(8, 2), FOREIGN KEY (room_id) REFERENCES rooms(room_id)",
		"history_id INT AUTO_INCREMENT PRIMARY KEY, room_id INT NOT NULL, head_count INT NOT NULL, change_timestamp TIMESTAMP NOT NULL, FOREIGN KEY (room_id) REFERENCES rooms(room_id)"
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
			createDBStmt.execute("CREATE DATABASE IF NOT EXISTS prisondb");
			URL = "jdbc:mysql://localhost:3306/prisondb?useSSL=FALSE&allowPublicKeyRetrieval=True";
			connection = DriverManager.getConnection(URL, USER, PASSWORD);
			
			for (int i = 0; i < tableNames.length; i++) {
				String make = "CREATE TABLE IF NOT EXISTS " + tableNames[i] + "(" + tableQuery[i] + ")";
				PreparedStatement createTableStmt = connection.prepareStatement(make);
				createTableStmt.executeUpdate();
			}
		} 
		catch (SQLException e) {
			throw new RuntimeException(e);
		}
	}
	private void startSerialMonitor() throws MalformedURLException {
		monitor = new SerialMonitor(connection);
		try {
			monitor.start();
		} catch (Exception e) {
			System.out.println("no Microbit detected");
		}
	}
	
	@Scheduled(cron = "0 */2 * ? * *")
	private void cleanup(){
		System.gc();
		System.out.println("cleaning up");
//		monitor.stop();
//		monitor=null;
//		try{
//			monitor= new SerialMonitor(connection);
//			monitor.start();
//		} catch (Exception e) {
//			//e.printStackTrace();
//		}
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
	private String getAllNames(){
		StringBuilder output = new StringBuilder();
		output.append("{\"names\":{"+
				"\"data\":[");
		try {
			Statement stmt = connection.createStatement();
			ResultSet rs = stmt.executeQuery("SELECT username FROM users");
			while (rs.next()) {
				output.append("{\"username\": \""+rs.getString("username")+"\"}");
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

	@RequestMapping(value = "/getEnv", produces = MediaType.APPLICATION_JSON_VALUE)
	private String getEnv(@RequestParam(value = "loc") String loc,@RequestParam(value="order")String order){
		StringBuilder output = new StringBuilder();
		output.append("{\"environment\":{\"data\":[");

		try {
			// Get room_id from rooms table using the room name (loc)
			PreparedStatement roomIdStatement = connection.prepareStatement(
					"SELECT room_id FROM rooms WHERE room_name = ?"
			);
			roomIdStatement.setString(1, loc);

			ResultSet roomIdResultSet = roomIdStatement.executeQuery();
			
			if (roomIdResultSet.next()) {
				int roomId = roomIdResultSet.getInt("room_id");
				ResultSet rs;
				if(order.equals("DESC")){
					// Fetch records from roomEnvironment using the obtained room_id
					PreparedStatement selectStatement = connection.prepareStatement(
							"SELECT * FROM roomEnvironment WHERE room_id = ? ORDER BY timestamp DESC"
					);
					selectStatement.setInt(1, roomId);
					rs = selectStatement.executeQuery();
				}else{
					// Fetch records from roomEnvironment using the obtained room_id
					PreparedStatement selectStatement = connection.prepareStatement(
							"SELECT * FROM roomEnvironment WHERE room_id = ? ORDER BY timestamp ASC"
					);
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
					output.append("{\"DataID\": \""+dataId+"\", \"Timestamp\": \""+timestamp.toString()+"\", \"Temperature\": \""+temperature.toString()+"\", \"NoiseLevel\": \""+noiseLevel.toString()+"\", \"LightLevel\": \""+lightLevel.toString()+"\"}");
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

	@GetMapping("/getPeople")
	private int getPeople(@RequestParam(value="loc") String loc, @RequestParam(value="type", required=false, defaultValue="inmate") String type) {
		int total = 0;

		try (PreparedStatement selectStatement = connection.prepareStatement(
				"SELECT COUNT(*) AS total_people " +
						"FROM roomOccupants ro " +
						"JOIN rooms r ON ro.room_id = r.room_id " +
						"JOIN users u ON ro.user_id = u.user_id " +
						"WHERE r.room_name = ? AND u.user_type = ?")) {

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
	private String getRooms(){
		StringBuilder output = new StringBuilder();
		output.append("{\"rooms\":{"+
				"\"data\":[");
		try {
			// Fetch all rooms from the database
			PreparedStatement selectStatement = connection.prepareStatement("SELECT * FROM rooms");
			ResultSet rs = selectStatement.executeQuery();
			// Iterate over the result set and build the output string
			while (rs.next()) {
				output.append("{\"room\": \""+rs.getString("room_name")+"\"}");
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

	@GetMapping("/listAll")
	private String listAll() {
		StringBuilder output = new StringBuilder();
		output.append("{\"locations\":{"+
				"\"data\":[");
		try {
			// Fetch all users and their latest location from the database
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT u.username, r.room_name, ro.entry_timestamp " +
							"FROM users u " +
							"JOIN roomoccupants ro ON u.user_id = ro.user_id " +
							"JOIN rooms r ON ro.room_id = r.room_id"
			);

			ResultSet rs = selectStatement.executeQuery();

			// Iterate over the result set and build the output string
			while (rs.next()) {
				String username = rs.getString("username");
				String roomName = rs.getString("room_name");
				Timestamp timestamp = rs.getTimestamp("entry_timestamp");

				//output.append("Location: ").append(roomName).append("!");
				output.append("{\"user\": \""+username+"\", \"Location\": \""+roomName+"\", \"Timestamp\": \""+timestamp.toString()+"\"}");
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

	@GetMapping("/createAcc")
	private boolean createAcc(@RequestParam(value = "user") String user, @RequestParam(value="pass") String pass,
	@RequestParam(value="type", required=false)String type){
		try {
			PreparedStatement insertStatement = connection.prepareStatement(
					"INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)"
			);
			insertStatement.setString(1, user);
			insertStatement.setString(2, hashPassword(pass));
			if(type==null){
				insertStatement.setString(3, "user"); // Assuming default user_type is "user"
			}else{
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
	private boolean checkLog(@RequestParam(value = "user") String user, @RequestParam(value="pass") String pass){
		try {
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT * FROM users WHERE username = ?"
			);
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
	private String getUserType(@RequestParam(value="user") String user){
		String type="";
		try{
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT user_type FROM users WHERE username = ?"
			);
			selectStatement.setString(1, user);
			ResultSet rs = selectStatement.executeQuery();
			if (rs.next()) {
				type = rs.getString("user_type");
			}
		}catch (Exception e) {
			e.printStackTrace();
		}
		return type;
	}
	@GetMapping("/setup")
	private boolean setup(@RequestParam(value="user") String user){return false;}

	@GetMapping("/saveMap")
	private void saveMap(@RequestParam(value="map")String map){
		//string = json
		JsonParser parser = JsonParserFactory.getJsonParser();
		Map<String, Object> jsonMap = parser.parseMap(map);

	}
	@GetMapping("/getMap")
	private String getMap(){
		StringBuilder output = new StringBuilder();
		output.append("{\"map\":{"+
				"\"data\":[");

		//SQL STATEMENT
		//output.append("{\"user\": \""+username+"\", \"Location\": \""+roomName+"\"}");
//		if(!rs.isLast()){
//			output.append(",");
//		}
		//^^EXAMPLE^^

		output.append("]}}");
		return output.toString();
	}

		@GetMapping("/transmitMessage")
	private String transmitMessage(
			@RequestParam(value = "personId") int personId,
			@RequestParam(value = "alertLevel", defaultValue = "1") int alertLevel,
			@RequestParam(value = "message") String message) {

		try {
			// Retrieve the microbit linked to the person from the database
			String microbitName = getMicrobitForPerson(personId);

			if (microbitName != null) {
				// Transmit the message to the microbit over serial with alert level
				// Will remove "/EOM/" and commas from the message and then append "/EOM/"" at the end of the message
				// To signify the end of packet transfer
				String sanitizedMessage = message.replace("/EOM/", "").replace(",", "");
				sanitizedMessage += "/EOM/";

				if (monitor != null) {
					String fullMessage = alertLevel + "," + microbitName + "," + sanitizedMessage;
					monitor.sendMessage(fullMessage);
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
			// Retrieve the microbits linked to users of the specified user type from the database
			List<String> microbitNames = getMicrobitsForUserType(userType);

			if (!microbitNames.isEmpty()) {
				// Construct the message with user type at the start and send to each microbit
				if (monitor != null) {
					for (String microbitName : microbitNames) {
						String fullMessage = userType + ":" + microbitName + "," + message;
						monitor.sendMessage(fullMessage);
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

	private String getMicrobitForPerson(int personId) throws SQLException {
		// Retrieve the microbit linked to the person from the database
		String microbitName = null;
		try {
			PreparedStatement selectMicrobitStatement = connection.prepareStatement(
					"SELECT user_microbit FROM users WHERE user_id = ?"
			);
			selectMicrobitStatement.setInt(1, personId);
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
		// Retrieve the microbits linked to users of the specified user type from the database
		List<String> microbitNames = new ArrayList<>();
		try {
			PreparedStatement selectMicrobitsStatement = connection.prepareStatement(
					"SELECT user_microbit FROM users WHERE user_type = ?"
			);
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
        // Adjust the log rounds to change security (larger number takes longer but more secure)
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
}
