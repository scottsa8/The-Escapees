package com.monitor.server;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.boot.SpringApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.mindrot.jbcrypt.BCrypt;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.sql.*;


@EnableScheduling
@SpringBootApplication
@RestController
@CrossOrigin(origins = "http://localhost:3000")
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
	}

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
			//e.printStackTrace();
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
	private String getEnv(@RequestParam(value = "loc") String loc){
		StringBuilder output = new StringBuilder();
		output.append("{\"enviornment\":{"+
				"\"data\":[");

		try {
			// need to get roomid from loc, loc=room name now
			// Assuming loc parameter is the room_id
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT * FROM roomEnvironment WHERE room_id = ?"
			);
			selectStatement.setString(1, loc);

			ResultSet rs = selectStatement.executeQuery();

			while (rs.next()) {
				int dataId = rs.getInt("data_id");
				Timestamp timestamp = rs.getTimestamp("timestamp");
				BigDecimal temperature = rs.getBigDecimal("temperature");
				BigDecimal noiseLevel = rs.getBigDecimal("noise_level");
				BigDecimal lightLevel = rs.getBigDecimal("light_level");
				// Customize the output format based on your needs

				output.append("{\"DataID\": \""+dataId+"\", \"Timestamp\": \""+timestamp.toString()+"\", \"Temperature\": \""+temperature.toString()+"\", \"NoiseLevel\": \""+noiseLevel.toString()+"\", \"LightLevel\": \""+lightLevel.toString()+"\"}");
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

	@GetMapping("/getPeople")
	private int getPeople(@RequestParam(value="loc") String loc) {
		int total = 0;

		try {
			// Fetch the total number of people in a specific location from the database
			PreparedStatement selectStatement = connection.prepareStatement(
					"SELECT COUNT(*) AS total_people " +
							"FROM roomOccupants ro " +
							"JOIN rooms r ON ro.room_id = r.room_id " +
							"WHERE r.room_name = ?"
			);
			selectStatement.setString(1, loc);

			ResultSet rs = selectStatement.executeQuery();

			// Retrieve the total count
			if (rs.next()) {
				total = rs.getInt("total_people");
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
					"SELECT u.username, r.room_name " +
							"FROM users u " +
							"JOIN roomOccupants ro ON u.user_id = ro.user_id " +
							"JOIN rooms r ON ro.room_id = r.room_id"
			);

			ResultSet rs = selectStatement.executeQuery();

			// Iterate over the result set and build the output string
			while (rs.next()) {
				String username = rs.getString("username");
				String roomName = rs.getString("room_name");
				//output.append("Location: ").append(roomName).append("!");
				output.append("{\"user\": \""+username+"\", \"Location\": \""+roomName+"\"}");
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
	private boolean createAcc(@RequestParam(value = "user") String user, @RequestParam(value="pass") String pass){
		try {
			PreparedStatement insertStatement = connection.prepareStatement(
					"INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)"
			);
			insertStatement.setString(1, user);
			insertStatement.setString(2, hashPassword(pass));
			insertStatement.setString(3, "user"); // Assuming default user_type is "user"
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


	public static String hashPassword(String plainPassword) {
        // Adjust the log rounds to change security (larger number takes longer but more secure)
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
}