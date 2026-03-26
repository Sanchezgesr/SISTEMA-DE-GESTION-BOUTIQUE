const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.post('/', purchaseController.create);

module.exports = router;
