const Session = require('../models/sessionModel');
const Charger = require('../models/chargerModel');
const { formatTimestamp } = require('../utils/dateUtils');
const { parseUrlDate } = require('../utils/dateUtils');
const { validateTimestamp } = require('../utils/validateUtils');
const { castType } = require('../utils/sanitizeUtils');
const { extractTimestamp } = require('../utils/sanitizeUtils');

const newSession = async (req, res, next) =>
{
	try
	{
		//deconstruct body tuple
		const { pointid, starttime, endtime, startsoc, endsoc, totalkwh, kwhprice, amount } = req.body;

		//convert pointid to integer
		const numChargerID = castType(pointid, "number");

		//check charger exists in database
		if ((await Charger.getById(numChargerID)) == null )
		{
			res.status(400);
                        return next (new Error ("charger doesn't exist"));
		}
		
		//extract valid start timestamp
		const validStartTime = extractTimestamp(starttime) + ":00";

		if ( validStartTime == null || !validateTimestamp(validStartTime) )
		{
			res.status(400);
                        return next (new Error ("starttime not valid timestamp"));
		}

		//extract valid end timestamp
                const validEndTime = extractTimestamp(endtime) + ":00";

                if ( validEndTime == null || !validateTimestamp(validEndTime) )
                {
                        res.status(400);
                        return next (new Error ("endtime not valid timestamp"));
                }

		//start time after endtime
		if ( validStartTime > validEndTime)
		{
			res.status(400);
                        return next (new Error ("endtime cannot be before starttime"));
                }

		//convert startsoc to integer
		const numStartSoc = castType(startsoc, "number");

		//startsoc must be between 0 and 100
		if (numStartSoc < 0 || numStartSoc > 100)
		{
			res.status(400);
                        return next (new Error ("startsoc must be between 0 and 100"));
		}

		//convert endsoc to integer
                const numEndSoc = castType(endsoc, "number");

		//endsoc must be between 0 and 100
                if (numEndSoc < 0 || numEndSoc > 100)
                {
                        res.status(400);
                        return next (new Error ("endsoc must be between 0 and 100"));
		}

		//check endsoc >= startsoc
                if ( numStartSoc > numEndSoc )
                {
                        res.status(400);
                        return next (new Error ("startsoc must be less than or equal to endsoc"));
                }

		//convert floats to strings
		const totalkwh_str = (castType(totalkwh, "number")).toFixed(3);
		const kwhprice_str = (castType(kwhprice, "number")).toFixed(3);
		
		//check correct math for amount
		if ( ((castType(amount, "number")).toFixed(3)) != (totalkwh*kwhprice).toFixed(3) )
		{
			res.status(400);
                        return next (new Error ("amount not equal to totalkwh * kwhprice"));
		};

		//success, return empty body
		return res.status(200).json();
	}
	catch (error)
	{
		next (error);
	}
};


const getSessions = async (req, res, next) =>
{
	try
	{
                //deconstruct body tuple
                const { id, starttime, endtime, startsoc, endsoc, totalkwh, kwhprice, Amount } = req.body;
                return res.status(200).json(id);
        }
        catch (error)
        {
                next(error);
        }
};

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
            res.status(404);
            console.log({ pointid: id, status: point.status, reservationendtime: point.reservationendtime });
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

        //get and check body parameters
        const { status, kwhprice } = req.body;

        if (!VALID_STATUSES.includes(status)) {
            res.status(400);
            const error = new Error(`Invalid status parameter. Supported values: ${VALID_STATUSES.join(', ')}`);
		    return next(error);
        }

        //update point object
        point.status = status;
        point.kwhprice = kwhprice;

        //update database
        await Charger.setPointStatus(id, status);
        await Charger.setKwhPrice(id, kwhprice);

        console.log({ pointid: id, status: point.status, kwhprice: point.kwhprice });
        return res.status(200).json({ pointid: id, status: point.status, kwhprice: point.kwhprice });

    } catch (error) {
        next(error);
    }
};

const getPrices = async (req, res, next) => {
    try {

        //get current date and time in required format YYYYMMDD0000
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const currentDateTime = `${year}${month}${day}0000`;

        //set up url parameters
        const url = "https://web-api.tp.entsoe.eu/api"
        const ENTSOE_TOKEN = process.env.ENTSOE_TOKEN;
        const documentType = "A44";
        const Domain = "10YGR-HTSO-----Y";
        const urlWithParams = `${url}?documentType=${documentType}&in_Domain=${Domain}&out_Domain=${Domain}&periodStart=${currentDateTime}&periodEnd=${currentDateTime}&securityToken=${ENTSOE_TOKEN}`;

        //fetch data from ENTSOE
        const response = await fetch(urlWithParams);
        const xmlText = await response.text();

        // parse XML and return ordered prices array
        const prices = new XMLParser().parse(xmlText).Publication_MarketDocument.TimeSeries.Period.Point.map(p => Number(p['price.amount']));
        return res.status(200).json({ prices });
        //currently the prices are returned in a list so prices[0] is 23:00-23:15 in UTC time which is 
        //actually the price for 01:00-01:15 in Greece local time (UTC+2)
    } catch (err) {
        res.status(500).json({ error: err.message });
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

        res.status(200).json(results);

    } catch (error) {
        next(error);
    }
};

module.exports = { newSession, getSessions };

