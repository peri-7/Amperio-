const express = require('express');
const router = express.Router();
const chargerController = require('../controllers/chargerController');
const responseFormatter = require('../middleware/responseFormatter');

router.get('/', responseFormatter, chargerController.getPoints);
router.get('/:id', chargerController.getPointDetails);

router.post('/:id', chargerController.reservePoint);
router.post('/:id/:minutes', chargerController.reservePoint);



module.exports = router;
