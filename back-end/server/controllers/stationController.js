const StationModel = require('../models/stationModel');

const db = require('../config/db'); 

const searchStations = async (req, res, next) => {
    try {
        const { q, power, connector, available } = req.query;

        // Using LEFT JOIN ensures stations show up even if chargers aren't fully mapped
        let queryText = `
            SELECT s.station_id, 
                s.address, 
                s.latitude, 
                s.longitude,
                s.facilities,
                CASE 
                    WHEN SUM(CASE WHEN ch.charger_status = 'available' THEN 1 ELSE 0 END) > 0 THEN 'available'
                    WHEN SUM(CASE WHEN ch.charger_status = 'charging' THEN 1 ELSE 0 END) > 0 THEN 'charging'
                    WHEN SUM(CASE WHEN ch.charger_status = 'reserved' THEN 1 ELSE 0 END) > 0 THEN 'reserved'
                    ELSE 'offline'
                END AS station_status
            FROM Station s
            LEFT JOIN Charger ch ON s.station_id = ch.station_id
            WHERE 1=1
        `;
        let queryParams = [];

        // 1. Text Search (MySQL LIKE is case-insensitive by default with most collations)
        if (q) {
            const searchPattern = `%${q}%`;
            // We push the pattern twice because we have two '?' in the OR statement
            queryParams.push(searchPattern, searchPattern);
            queryText += ` AND (s.address LIKE ? OR s.facilities LIKE ?)`;
        }

        // 2. Power Filter
        if (power && power !== "" && power !== 'undefined') {
            queryParams.push(Number(power));
            queryText += ` AND ch.power = ?`;
        }

        // 3. Connector Filter
        if (connector && connector !== "" && connector !=='undefined') {
            queryParams.push(connector);
            queryText += ` AND ch.connector_type = ?`;
        }

        // 4. Availability Filter
        if (available === 'true') {
            queryText += ` AND ch.charger_status = 'available'`;
        }

        // 2. Add the GROUP BY so the aggregate functions (SUM) work
        queryText += ` GROUP BY s.station_id`;

        // For MySQL, 'db.query' usually returns [rows, fields]
        const [rows] = await db.query(queryText, queryParams);
        
        // Send the rows directly
        res.status(200).json(rows);

    } catch (error) {
        console.error("Database Error:", error);
        next(error);
    }
};

const getAllStations = async (req, res,next) => {
    try {
        const stations = await StationModel.getAllStations();
        res.status(200).json(stations);
    } catch (error) {
        next(error);
    }
};

const getStation = async (req,res,next) => {
    try{
        const {id} = req.params;
        const station = await StationModel.getStationById(id);

        if(!station){
            return res.status(404).json({message: "Station not found."});
        }

        res.status(200).json(station);
    }
        catch(error){
            next(error);
        }
};

module.exports = {getAllStations,getStation, searchStations};