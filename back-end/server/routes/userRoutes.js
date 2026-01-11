const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 
const verifyToken = require('../middleware/authToken');


router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateUserProfile);
router.get('/userdata', verifyToken, userController.getUserData);

module.exports = router;
