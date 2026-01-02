const db = require('../config/db');

const getFilterOptions = async (req, res,next) => {
    try {
        //Fetch unique connectors and ower levels
        const connectors = ["Type 2", "CSS1", "CCS2", "CHAdeMO"];
        const powers = [11, 22, 50, 120, 180];
        res.status(200).json({
            connectors: connectors,
            powers: powers
        });
    }
    catch (error){
        next(error);
    }
};

module.exports = { getFilterOptions};