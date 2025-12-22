const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.newSession);

//router.get('/:id/:from/:to', sessionController.getSessions);

module.exports = router;
