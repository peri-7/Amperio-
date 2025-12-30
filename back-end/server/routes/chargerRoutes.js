const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');
const responseFormatter = require('../middleware/responseFormatter');

//router.get('/test', chargerController.getPricePerKwh);

module.exports = router;
