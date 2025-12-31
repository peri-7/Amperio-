const { validateType } = require('../utils/validateUtils');

//avoid a bad request due to missing or invalid fields
//checks for business logic in the controller
const validateNewSession = (req, res, next) =>
{
	try
	{
		//check if body exists
		if( validateType(req.body, "null") )
		{
                        res.status(400);
                        return next (new Error ("body missing"));
		}

		//check if body is empty
		if (Object.keys(req.body).length === 0) 
		{
        		res.status(400);
        		return next(new Error("empty body"));
    		}

                //fields required in the request body
                const requiredFields =
                [
                        { key: "pointid", type: "integer", msg: "charger ID missing or not integer" },
                        { key: "starttime", type: "string", msg: "starttime missing or not string" },
                        { key: "endtime", type: "string", msg: "endtime missing or not string" },
                        { key: "startsoc", type: "integer", msg: "startsoc missing or not integer" },
                        { key: "endsoc", type: "integer", msg: "endsoc missing or not integer" },
                        { key: "totalkwh", type: "number", msg: "totalkwh missing or not a number" },
                        { key: "kwhprice", type: "number", msg: "kwhprice missing or not a number" },
                        { key: "amount", type: "number", msg: "amount missing or not a number" },
                ];

		//check all fields exist and are correct type
                for (const field of requiredFields) 
                {
                        if (!validateType(req.body[field.key], field.type)) 
                        {
                                res.status(400);
                                return next(new Error(field.msg));
                        }
                 }

                next(); // all validations passed
	}
	catch (error)
	{
		next (error);
	}
};

module.exports = { validateNewSession };

