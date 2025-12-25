const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');
const sessionController = require('../controllers/sessionController');
const responseFormatter = require('../middleware/responseFormatter');

// a) lista fortistwn
router.get('/points/', responseFormatter, chargerController.getPoints);
// b) dedomena fortisth
router.get('/point/:id', chargerController.getPointDetails);
// c) desmeysh fortisth
router.post('/reserve/:id/:minutes', chargerController.reservePoint);
router.post('/reserve/:id', chargerController.reservePoint);
// d) enhmerwsh fortisth
router.post('/udpoint/:id', chargerController.updatePoint);
// e) katagrafh session
router.post('/newsession/', sessionController.newSession);
// f) lista sessions
// router.get('/sessions/:id/:from/:to', sessionController.getSessions);
// g) metaboles katasthshs shmeiou
router.get('/pointstatus/:pointid/:from/:to',responseFormatter,chargerController.getTimePointStatus);


module.exports = router;
