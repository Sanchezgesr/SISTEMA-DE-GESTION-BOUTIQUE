const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/kpis', dashboardController.getKpis);

module.exports = router;
