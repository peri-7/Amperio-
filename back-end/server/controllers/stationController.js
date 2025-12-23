const StationModel = require('../models/stationModel');

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

module.exports = {getAllStations,getStation};