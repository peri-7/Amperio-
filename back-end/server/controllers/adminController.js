const path = require('path');
const fs = require('fs').promises;
const Station = require('../models/stationModel');
const Charger = require('../models/chargerModel');
const db = require('../config/db');
const { JsonToDb } = require('../utils/dataFormatter');

//hardwired path to the reset data json file
const RESET_DATA_PATH = path.join(__dirname, '../../database/sample_data/reset_data.json');

//controller to reset points to initial state from reset data json file
const resetpoints = async (req, res, next) => {
    //only implement changes if everything goes well
    let connection;
    try {
        const rawData = await fs.readFile(RESET_DATA_PATH, 'utf-8');
        const points = JSON.parse(rawData);

        //connect for transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        //delete existing data  
        await Charger.deleteAll(connection);
        await Station.deleteAll(connection);

        // import data from reset file
        for (const entry of points) {
            // format data
            const { stationData, chargers } = JsonToDb(entry);

            //insert station
            await Station.create(stationData, connection);

            //insert chargers
            for (const chargerData of chargers) {
                await Charger.create(chargerData, connection);
            }
        }

        //commit transcation
        await connection.commit();

        return res.status(200).json({
            status: "OK",
            message: 'Data reset to initial state successfully.'
         });

    } catch (error) {
        //rollback transaction on error
        if (connection) await connection.rollback();
        
        next(error);
    } finally {
        //release connection
        if (connection) connection.release();
    }
};

/*const addpoints = async (req, res, next) => {
*/    

module.exports = { resetpoints };

    