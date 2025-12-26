const db = require('../config/db'); // Import the database connection

class UserStatsModel {

	// return kpis
	static async getKpis(id) {
		const sql = 'Select Count(session_id) as totalSessions, Sum(energy_delivered) as totalEnergy From Session Where user_id = ?'
		const [rows] = await db.query(sql, id);
		return rows[0];
	}

	static async getChartData(id) {
		const sql = `
			SELECT s.session_id, s.start_time, s.energy_delivered, s.price_per_kwh, st.station_id, st.address
			FROM Session s
			JOIN Charger c ON s.charger_id = c.charger_id
			JOIN Station st ON c.station_id = st.station_id
			WHERE user_id = ?
			ORDER BY s.start_time ASC
			`;
		const [rows] =await db.query(sql, id);
		return rows;
	}
}

module.exports = UserStatsModel;
