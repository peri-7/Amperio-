const Charger = require('../models/chargerModel');
const { formatTimestamp } = require('../utils/dateUtils');

// Define the valid statuses based on your requirements
const VALID_STATUSES = ['available', 'charging', 'reserved', 'out_of_order'];

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
            return res.status(200).sendData(points);
        }

        // CASE 2: No status provided, return all points
        const points = await Charger.getAllChargers();
        return res.status(200).sendData(points);

    } catch (error) {
        next(error);
    }
};

const getPointDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Fetch data
        const point = await Charger.getById(id);

        // 2. Handle 404 - Not Found
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
            res.status(404); //shouldn't this be a 400 error since its invalid parameters??
            return next(new Error(`Point with ID ${id} not found for reservation`));
        }
        
        //get minutes or set default
        let minutes = req.params.minutes !== undefined ? parseInt(req.params.minutes, 10) : 30;

        //check if valid
        if (Number.isNaN(minutes) || minutes <= 0 || minutes > 24 * 60) {
            res.status(400);
            return next(new Error('Invalid minutes parameter. Must be an integer between 1 and 1440'));
        }//here there is a check for the validity of the minutes data but we dont really care about it
        //basically the exercise says if its above the max we set it to the max and if its below the min
        //we set it to the min but should we still do that if the values are extremely out of range?

        //check if point is available
        if( await Charger.getPointStatus(id) == 'available') {
            //set json parameters
            point.status = 'reserved';
            point.reservationendtime = formatTimestamp(new Date(Date.now() + minutes*60000));

            //update database
            await Charger.setPointStatus(id, 'reserved'); //do we need to check if these await functions time out somehow?
            await Charger.setReservationEndTime(id, point.reservationendtime);
            
            console.log({ pointid: id, status: point.status, reservationendtime: point.reservationendtime });
            return res.status(200).json({ pointid: id, status: point.status, reservationendtime: point.reservationendtime });
        }
        else {
            res.status(400);
            console.log({ pointid: id, status: point.status, reservationendtime: point.reservationendtime });
            return next(new Error(`Point with ID ${id} is not available for reservation`));
        }
    } catch (error) {
        next(error);
    }
};



module.exports = { getPoints, getPointDetails, reservePoint, healthcheck };

