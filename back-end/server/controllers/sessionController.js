const Session = require('../models/sessionModel');
const Charger = require('../models/chargerModel');
const { formatTimestamp } = require('../utils/dateUtils');
const { parseUrlDate } = require('../utils/dateUtils');
const { XMLParser } = require('fast-xml-parser');
const { validateTimestamp } = require('../utils/validateUtils');
const { castType } = require('../utils/sanitizeUtils');
const { validateType } = require('../utils/validateUtils');
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
		if ( validStartTime >= validEndTime)
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
		if (Math.round(amount*100) !== Math.round((totalkwh*kwhprice)*100))
		{
			res.status(400);
                        return next (new Error ("amount not equal to totalkwh * kwhprice"));
		};

		//check if session already exists
		const searchDupSession = await Session.searchSession(numChargerID, validStartTime);

		if (searchDupSession != null)
		{
			res.status(400);
			return next (new Error ("session already exists, no duplicates allowed"));
		}

		const resp = await Session.createSession(numChargerID, validStartTime, validEndTime, numStartSoc, numEndSoc, totalkwh_str, kwhprice_str);

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
                const { id, from, to } = req.params;

		if ( !validateType(id, "integer") )
		{
			res.status(400);
			return next (new Error ("id must be integer"));
		}
		
		//convert id to integer
                const numChargerID = castType(id, "number");

		const validFrom = parseUrlDate(from) + " 00:00:00";
		const validTo = parseUrlDate(to) + " 23:59:00";

		if ( validFrom == null || validTo == null)
		{
			res.status(400);
			return next (new Error ("Wrong timestamp format. Use YYYYMMDD"));
		}

		const resp = await Session.rangeSessionSearch(numChargerID, validFrom, validTo);

		//empty list
		if (resp.length === 0)
		{
			return res.status(201).sendData();
		}
		else
		{
			return res.status(200).sendData(resp);
		}

        }
        catch (error)
        {
                next(error);
        }
};

module.exports = { newSession, getSessions };

