const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/auth');

// GET settings needs to be public for the Login title reflection
router.get('/', settingController.getSettings);

// Put updates behind authentication
router.use(authMiddleware);
router.put('/', settingController.updateSettings);

module.exports = router;
