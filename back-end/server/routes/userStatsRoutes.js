const express = require('express');
const router = express.Router();
const userStatsController = require('../controllers/userStatsController'); 
const verifyToken = require('../middleware/authToken');



router.get('/kpis', verifyToken, userStatsController.getKpis);
router.get('/charts', verifyToken, userStatsController.getChartData);

module.exports = router;
