const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

router.get('/:id',stationController.getStation);
router.get('/',stationController.getAllStations);


module.exports = router;