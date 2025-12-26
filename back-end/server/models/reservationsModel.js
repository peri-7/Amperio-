const db = require('../config/db'); // Import the database connection

class ReservationsModel {

	static async upcoming(id) {
		const sql = `
		Select s.address, r.reservation_end_time 
		from Reservation r 
		join Charger c on r.charger_id = c.charger_id 
		join Station s on c.station_id = s.station_id 
		where r.user_id = ? and r.reservation_start_time > NOW()
		order by r.reservation_start_time asc
		`;
		const [rows] = await db.query(sql, id);
		return rows;
	}
}

module.exports = ReservationsModel;
