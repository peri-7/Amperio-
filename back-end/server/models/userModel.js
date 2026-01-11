const db = require('../config/db'); // Import the database connection

class UserModel {

	// return data from user with that ID
	static async findByID(id) {
		const sql = 'SELECT username, email, default_charger_power, default_connector_type, role FROM Users WHERE user_id = ?';
		const [rows] = await db.query(sql, id);
		return rows[0]; 
	}

	// return data from user with that email or username
	static async findByIdentifier(email, name) {
		const sql = 'SELECT * FROM Users WHERE email = ? OR username = ? LIMIT 1';
		const [rows] = await db.query(sql, [email, name]);
		return rows[0]; 
	}

	// create new user
	static async create(name, email, password) {
		const sql = 'INSERT INTO Users (username, email, safe_password, role) VALUES (?, ?, ?, ?)'; 
		const [result] = await db.query(sql, [name, email, password, 'user']); // pwd is hashed from controller
		return result;
	}

	// update user data
	static async update(id, updates) {
		const fields = [];
		const values = [];

		if (Object.prototype.hasOwnProperty.call(updates, 'username')) {
			fields.push('username = ?');
			values.push(updates.username);
		}
		if (Object.prototype.hasOwnProperty.call(updates, 'email')) {
			fields.push('email = ?');
			values.push(updates.email);
		}
		if (Object.prototype.hasOwnProperty.call(updates, 'default_charger_power')) {
			fields.push('default_charger_power = ?');
			values.push(updates.default_charger_power);
		}
		if (Object.prototype.hasOwnProperty.call(updates, 'default_connector_type')) {
			fields.push('default_connector_type = ?');
			values.push(updates.default_connector_type);
		}
		if (Object.prototype.hasOwnProperty.call(updates, 'safe_password')) {
			fields.push('safe_password = ?');
			values.push(updates.safe_password);
		}

		if (fields.length === 0) return null;

		values.push(id);
		const sql = `UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`;
		const [result] = await db.query(sql, values);
		return result;
	}

	// return all data from all users
	static async getAll() {
		const sql = 'SELECT * FROM Users';
		const [rows] = await db.query(sql); 
		return rows;
	}
}

module.exports = UserModel;
