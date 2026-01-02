const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');
const adminController = require('../controllers/adminController');

router.get('/healthcheck', chargerController.healthcheck);
router.post('/resetpoints', adminController.resetpoints);
//router.post('/addpoints', adminController.addpoints);

module.exports = router;

