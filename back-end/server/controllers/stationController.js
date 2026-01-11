const StationModel = require('../models/stationModel');

const db = require('../config/db'); 

const searchStations = async (req, res, next) => {
    try {
        const { q, power, connector, available, facilities,score } = req.query;

        // Using LEFT JOIN ensures stations show up even if chargers aren't fully mapped
        let queryText = `
            SELECT s.station_id, 
                s.address, 
                s.latitude, 
                s.longitude,
                s.facilities,
                s.score,
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
            const powerArray = power.split(',').map(p=>Number(p.trim())).filter(p=>!isNaN(p));
            // For multiple power levels, we can use IN clause
            if (powerArray.length > 0) {
                //creates "AND ch.power IN (?,?,?)" depending on how many power levels are selected
                const placeholders = powerArray.map(()=>'?').join(', ');
                queryText += ` AND ch.power IN (${placeholders})`;
                queryParams.push(...powerArray);
            }
        }

        // 3. Connector Filter
        if (connector && connector !== "" && connector !=='undefined') {
            const connectorArray = connector.split(',').map(c=>c.trim()).filter(c=>c);
            // For multiple connectors, we can use IN clause
            if (connectorArray.length > 0) {
                const placeholders = connectorArray.map(() => '?').join(', ');
                queryText += ` AND ch.connector_type IN (${placeholders})`;
                queryParams.push(...connectorArray);
            }
        }

        // 4. Availability Filter
        if (available === 'true') {
            queryText += ` AND ch.charger_status = 'available'`;
        }

        // 5. Facilities Filter - handle comma-separated string
        if (facilities && facilities !== "" && facilities !== 'undefined') {
            // facilities comes as a comma-separated string from URL params
            const facilitiesArray = typeof facilities === 'string'
                ? facilities.split(',').map(f => f.trim()).filter(f => f)
                : (Array.isArray(facilities) ? facilities : []);

            if (facilitiesArray.length > 0) {
                // Create OR conditions: s.facilities LIKE ? OR s.facilities LIKE ? ...
                const orConditions = facilitiesArray.map(() => 's.facilities LIKE ?').join(' OR ');
                queryText += ` AND (${orConditions})`;
                // Push each facility as a search pattern (with % wildcards)
                facilitiesArray.forEach(f => {
                    queryParams.push(`%${f}%`);
                });
            }
        }

        //6. Score Filter
        // 6. Score Filter - Selects stations with score >= lowest selected value
if (req.query.score && req.query.score !== "" && req.query.score !== 'undefined') {
    const scoreArray = req.query.score.split(',')
        .map(s => Number(s.trim()))
        .filter(s => !isNaN(s));

    if (scoreArray.length > 0) {
        // Find the lowest score selected (e.g., if user picks 3 and 4, we want >= 3)
        const minScore = Math.min(...scoreArray);
        
        queryText += ` AND s.score >= ?`;
        queryParams.push(minScore);
    }
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
            res.status(404);
            return next(new Error("Station not found."));
        }

        res.status(200).json(station);
    }
        catch(error){
            next(error);
        }
};

module.exports = {getAllStations,getStation, searchStations};