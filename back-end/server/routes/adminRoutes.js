const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');

router.get('/healthcheck', chargerController.healthcheck);

module.exports = router;

