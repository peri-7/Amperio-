const db = require('../config/db'); // Import the database connection

class sessionModel {

	// return data from session
	static async findByID(id) {
		const sql = 'SELECT username, email, default_charger_power, role FROM users WHERE user_id = ?';
		const [rows] = await db.query(sql, id);
		return rows[0]; 
	}

	// create new session
	// given values of a session, it creates a new session
	// user_id, progress and preblocked money are optional
	static async createSession(id, startTime, endTime, startSoc, endSoc, totalKwh, kwhPrice, user_id = 1, progress = 100, preblocked_money = 0) {
		const sql = 'INSERT INTO Session (charger_id, start_time, end_time, start_soc, end_soc, ' + 
			    'energy_delivered, price_per_kwh, money_preblocked, user_id, session_progress) ' +
                            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
		const [result] = await db.query(sql, [id, startTime, endTime, startSoc, endSoc, totalKwh, kwhPrice, preblocked_money, user_id, progress]);
		return result;
	}
}

module.exports = sessionModel;
