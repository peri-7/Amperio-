const db = require('../config/db');

class StationModel {
    static async getAllStations() {
    const query = `
        SELECT 
            s.station_id, 
            s.address, 
            s.latitude, 
            s.longitude,
            CASE 
                WHEN SUM(CASE WHEN c.charger_status = 'available' THEN 1 ELSE 0 END) > 0 THEN 'available'
                WHEN SUM(CASE WHEN c.charger_status = 'charging' THEN 1 ELSE 0 END) > 0 THEN 'charging'
                WHEN SUM(CASE WHEN c.charger_status = 'reserved' THEN 1 ELSE 0 END) > 0 THEN 'reserved'
                ELSE 'offline'
            END AS station_status
        FROM Station s
        LEFT JOIN Charger c ON s.station_id = c.station_id
        GROUP BY s.station_id
    `;
    
    const [stations] = await db.query(query);
    return stations;
    }

    static async getStationById(id) {
    // We join the Station and Charger tables
    const query = `
        SELECT s.*, c.charger_id, c.power, c.charger_status, c.connector_id
        FROM Station s
        LEFT JOIN Charger c ON s.station_id = c.station_id
        WHERE s.station_id = ?
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) return null;

    // Because of the JOIN, we get one row per charger. 
    // We need to format it so chargers are in an array.
    const station = {
        station_id: rows[0].station_id,
        address: rows[0].address,
        facilities: rows[0].facilities,
        lat: rows[0].lat,
        lng: rows[0].lng,
        chargers: rows.filter(r => r.charger_id !== null).map(r => ({
            charger_id: r.charger_id,
            power: r.power,
            charger_status: r.charger_status,
            connector_id: r.connector_id
        }))
    };

    return station;
    }
    
}

module.exports = StationModel;