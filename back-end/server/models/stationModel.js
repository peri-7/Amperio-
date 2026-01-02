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
            SELECT s.*, c.charger_id, c.power, c.charger_status, c.connector_type
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
            lat: rows[0].latitude,
            lng: rows[0].longitude,
            chargers: rows.filter(r => r.charger_id !== null).map(r => ({
                charger_id: r.charger_id,
                power: r.power,
                charger_status: r.charger_status,
                connector_type: r.connector_type
            }))
        };

        return station;
    }

    static async deleteAll(connection) {
        const query = "DELETE FROM Station";
        return connection.query(query);
    }

    static async create(stationData, connection) {
        const query = `
            INSERT INTO Station (station_id, address, longitude, latitude, postal_code, facilities, google_maps_link, score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            stationData.station_id,
            stationData.address,
            stationData.longitude,
            stationData.latitude,
            stationData.postal_code,
            stationData.facilities,
            stationData.google_maps_link,
            stationData.score
        ];

        return connection.query(query, params);
    }

};

module.exports = StationModel;