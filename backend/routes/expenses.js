const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', expenseController.getAll);
router.post('/', expenseController.create);
router.delete('/:id', expenseController.remove);

module.exports = router;
