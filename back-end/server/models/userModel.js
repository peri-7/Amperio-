const db = require('../config/db'); // Import the database connection

class UserModel {

	// return data from user with that email
	static async findByEmail(email) {
		const sql = 'SELECT * FROM users WHERE email = ?';
		const [rows] = await db.query(sql, [email]);
		return rows[0]; 
	}

	// create new user
	static async create(name, email, password) {
		const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'; 
		const [result] = await db.query(sql, [name, email, password]); // pwd is hashed from controller
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
