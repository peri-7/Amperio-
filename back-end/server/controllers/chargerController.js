const Charger = require('../models/chargerModel');
const { formatTimestamp } = require('../utils/dateUtils');
const { parseUrlDate } = require('../utils/dateUtils');
const { XMLParser } = require('fast-xml-parser');



// Define the valid statuses based on your requirements
const VALID_STATUSES = ['available', 'charging', 'reserved', 'offline', 'malfunction'];

const getPoints = async (req, res, next) => {
    try {
        const { status } = req.query;

        // CASE 1: Status parameter IS provided
        if (status) {
            // Requirement: Return 401 if status is not in the enumeration
            if (!VALID_STATUSES.includes(status)) {
                res.status(400);
                const error = new Error(`Invalid status parameter. Supported values: ${VALID_STATUSES.join(', ')}`);
		        return next(error);
            }

            // If valid, fetch filtered points using the static method
            const points = await Charger.getByStatus(status);
		if(points.length === 0) {
			return res.status(204).sendData(points);
		}
            return res.status(200).sendData(points);
        }

        // CASE 2: No status provided, return all points
        const points = await Charger.getAllChargers();
		if(points.length === 0) {
			return res.status(204).sendData(points);
		}
        return res.status(200).sendData(points);

    } catch (error) {
        next(error);
    }
};

const getPointDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate that id is a valid integer
        if (!/^\d+$/.test(id)) {
            res.status(400);
            return next(new Error('Point ID must be a valid integer.'));
        }

        // 1. Fetch data
        const point = await Charger.getById(id);
        
        // 2. Handle 204 - Not Found
        if (!point) {
            res.status(404);
            return next(new Error(`Point with ID ${id} not found`));
        }

        // 3. Format the date using your existing utility
        // The View returns a raw Date object; your utility makes it "YYYY-MM-DD HH:mm"
        if (point.reservationendtime) {
            point.reservationendtime = formatTimestamp(point.reservationendtime);
        }

        // 4. Return JSON
        res.status(200).json(point);

    } catch (error) {
        next(error);
    }
};

// Healthcheck
const healthcheck = async (req, res, next) => {
    try {
        const stats = await Charger.healthcheck();

        // Create connection  Strring
        // Ideally use process.env variables. If not available, placeholders are used.
        // WARNING: Avoid showing real passwords in production.
        const dbUser = process.env.DB_USER || 'root';
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbName = process.env.DB_NAME || 'amperio';
        const connectionString = `mysql://${dbUser}@${dbHost}/${dbName}`; // Requested version

        //build 200 OK response
        res.status(200).json({
            status: "OK",
            dbconnection: connectionString,
            n_charge_points: stats.total,
            n_charge_points_online: stats.online,
            n_charge_points_offline: stats.offline
        });

    } catch (error) {
        res.status(400);
	next(error);
}
};


const reservePoint = async (req, res, next) => {
    try {
        
        //get point
        const { id } = req.params;
        const point = await Charger.getById(id);

        //check if it exists
        if (!point) {
            res.status(404);
            return next(new Error(`Point with ID ${id} not found for reservation`));
        }
        
        //get minutes or set default
        let minutes = req.params.minutes !== undefined ? parseInt(req.params.minutes, 10) : 30;

        //check if valid
        if (Number.isNaN(minutes) || minutes <= 0 || minutes > 60) {
            minutes = Math.min(Math.max(minutes, 30), 60);
        }

        //check if point is available
        if( await Charger.getPointStatus(id) == 'available') {
            //set json parameters
            point.status = 'reserved';
            point.reservationendtime = formatTimestamp(new Date(Date.now() + minutes*60000));

            //update database
            await Charger.setPointStatus(id, 'reserved');
            await Charger.setReservationEndTime(id, point.reservationendtime);
            
            console.log({ pointid: id, status: point.status, reservationendtime: point.reservationendtime });
            return res.status(200).json({ pointid: id, status: point.status, reservationendtime: point.reservationendtime });
        }
        else {
            const failureTime = "1970-01-01 00:00";
            res.status(404);
            console.log({ pointid: id, status: point.status, reservationendtime: failureTime });
            return next(new Error(`Point with ID ${id} is not available for reservation`));
        }
    } catch (error) {
        next(error);
    }
};

const updatePoint = async (req, res, next) => {
    try {

        //get and check id
        const { id } = req.params;
        const point = await Charger.getById(id);

        if (!point) {
            res.status(404);
            return next(new Error(`Point with ID ${id} not found for update`));
        }

        //get body parameters
        const { status, kwhprice } = req.body;

        //check if at least one parameter is provided
        if (status === undefined && kwhprice === undefined) {
            console.log('No parameters provided for update.');
            res.status(400);
            return next(new Error('Please provide either status or kwhprice to update.'));
        }

        if (status !== undefined) {
            if (!VALID_STATUSES.includes(status)) {
                console.log(`Invalid status parameter: ${status}`);
                res.status(400);
                return next(new Error(`Invalid status parameter. Supported values: ${VALID_STATUSES.join(', ')}`));
            }

            // update local object and DB
            point.status = status;
            await Charger.setPointStatus(id, status);
        }
        if (kwhprice !== undefined) {
            console.log(`Updating kwhprice to: ${kwhprice}`);
            //update local object and DB
            point.kwhprice = kwhprice;
            await Charger.setKwhPrice(id, kwhprice);
        }

        console.log({ pointid: id, status: point.status, kwhprice: point.kwhprice });
        return res.status(200).json({ pointid: id, status: point.status, kwhprice: point.kwhprice });

    } catch (error) {
        next(error);
    }
};


const getTimePointStatus= async (req, res,next) => {
    try {
        const { pointid, from, to } = req.params;

        // 1. Convert URL strings (YYYYMMDD) to SQL format (YYYY-MM-DD)
        const sqlFrom = parseUrlDate(from);
        const sqlTo = parseUrlDate(to);

        // 2. Validation: If the dates are invalid, return a 400 Bad Request
        if (!sqlFrom || !sqlTo) {
            const err = new Error("Invalid date format. Use YYYYMMDD.");
            err.statusCode = 400; 
            return next(err);
        }

        // 3. Call the Model with the sanitized strings
        // We append ' 00:00' and ' 23:59' to ensure we cover the full range of the days
        const results = await Charger.getTimePointStatus(
            pointid, 
            `${sqlFrom} 00:00`, 
            `${sqlTo} 23:59`
        );

        if (results.length === 0) {
            return res.status(204).send();
        }

        res.status(200).json(results);

    } catch (error) {
        next(error);
    }
};

module.exports = { getPoints, getPointDetails, reservePoint, healthcheck , getTimePointStatus, updatePoint };

