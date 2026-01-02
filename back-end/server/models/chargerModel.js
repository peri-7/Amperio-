const db = require('../config/db');

class ChargerModel {

	// Return all points from the View
	static async getAllChargers() {
		const sql = 'SELECT * FROM Points';
		const [rows] = await db.query(sql);
		return rows;
	}

	// Return points filtered by status
	static async getByStatus(status) {
		const sql = 'SELECT * FROM Points WHERE status = ?';
		const [rows] = await db.query(sql, [status]); 
		return rows;
	}
	// get specific point on ip
	static async getById(id) {
		const sql = 'SELECT * FROM PointDetail WHERE pointid = ?';
		const [rows] = await db.query(sql, [id]);

		// Return the first result (or undefined if not found)
		return rows[0];
	}

	// do healthcheck
	static async healthcheck() {
		const sql = `SELECT 
				COUNT(*) as total,
				COALESCE(SUM(CASE WHEN charger_status IN ('available', 'charging', 'reserved') THEN 1 ELSE 0 END),0) as online,
				COALESCE(SUM(CASE WHEN charger_status IN ('offline', 'malfunction') THEN 1 ELSE 0 END),0) as offline
			    FROM Charger;`
		const [rows] = await db.query(sql);
		return rows[0];
	}

	//get Specific Point Status
	static async getPointStatus(id) {
		const sql = 'SELECT status FROM Points WHERE pointid = ?';
		const [rows] = await db.query(sql, [id]);
		return rows[0].status;
	}

	static async setPointStatus(id, status) {
		const sql = 'UPDATE Points SET status = ? WHERE pointid = ?';
		const [result] = await db.query(sql, [status, id]);
		return result;
	}

	static async setReservationEndTime(id, endTime) {
		// Insert a reservation record for this charger. user_id is NULL because this endpoint doesn't provide user context.
		const sql = 'INSERT INTO Reservation (user_id, charger_id, reservation_start_time, reservation_end_time) VALUES (NULL, ?, NOW(), ?)';
		const [result] = await db.query(sql, [id, endTime]);
		return result;
	}

	static async setKwhPrice(id, price) {
		const sql = 'UPDATE Charger SET current_price = ? WHERE charger_id = ?';
		const [result] = await db.query(sql, [price, id]);
		return result;
	}

	static async getTimePointStatus(id,startTime,endTime){
		const sql = 'SELECT timeref,old_state,new_state FROM StatusHistory  WHERE charger_id=? AND timeref BETWEEN ? AND ? ORDER BY timeref ASC ';
		const [result] = await db.query(sql,[id,startTime,endTime]);
		return result;
	}

	  static async create(chargerData, connection) {
        const query = `
            INSERT INTO Charger (charger_id, power, connector_type, station_id, installed_at, last_checked, charger_status, current_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            chargerData.charger_id,
            chargerData.power,
            chargerData.connector_type,
            chargerData.station_id,
            chargerData.installed_at,
            chargerData.last_checked,
            chargerData.charger_status,
            chargerData.current_price
        ];

        return connection.query(query, params);
    }
           
     static async deleteAll(connection) {
        const query = "DELETE FROM Charger";
        return connection.query(query);
    }

};


module.exports = ChargerModel;
