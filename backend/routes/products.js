const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
