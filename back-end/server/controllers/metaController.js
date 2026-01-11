const db = require('../config/db');
const { FACILITIES , RATINGS } = require('../utils/dataFormatter');


const getFilterOptions = async (req, res,next) => {
    try {
        //Fetch unique connectors and power levels
        const connectors = ["Type 2", "CCS1", "CCS2", "CHAdeMO"];
        const powers = [11, 22, 50, 120, 180];
        res.status(200).json({
            connectors: connectors,
            powers: powers,
            facilities: FACILITIES,
            score: RATINGS
        });
    }
    catch (error){
        next(error);
    }
};

module.exports = { getFilterOptions};
