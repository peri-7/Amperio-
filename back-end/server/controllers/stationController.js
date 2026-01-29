const StationModel = require('../models/stationModel');

const db = require('../config/db'); 

const searchStations = async (req, res, next) => {
  try {
    const filters = {
      q: req.query.q,
      power: req.query.power ? req.query.power.split(',').map(Number) : [],
      connector: req.query.connector ? req.query.connector.split(',') : [],
      available: req.query.available === 'true',
      facilities: req.query.facilities ? req.query.facilities.split(',') : [],
      score: req.query.score ? req.query.score.split(',').map(Number) : []
    };

    const stations = await StationModel.searchStations(filters);
    res.status(200).json(stations);
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
