const db = require('../config/db'); // Import the database connection

class UserModel {

	// return data from user with that ID
	static async findByID(id) {
		const sql = 'SELECT username, email, default_charger_power, role FROM users WHERE user_id = ?';
		const [rows] = await db.query(sql, id);
		return rows[0]; 
	}

	// return data from user with that email or username
	static async findByIdentifier(email, name) {
		const sql = 'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1';
		const [rows] = await db.query(sql, [email, name]);
		return rows[0]; 
	}

	// create new user
	static async create(name, email, password) {
		const sql = 'INSERT INTO users (username, email, safe_password, role) VALUES (?, ?, ?, ?)'; 
		const [result] = await db.query(sql, [name, email, password, 'user']); // pwd is hashed from controller
		return result;
	}

	// return all data from all users
	static async getAll() {
		const sql = 'SELECT * FROM users';
		const [rows] = await db.query(sql); 
		return rows;
	}
}

module.exports = UserModel;
