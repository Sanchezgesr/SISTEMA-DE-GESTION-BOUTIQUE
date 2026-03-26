const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.get('/consultar/:dni', customerController.consultarDni);
router.get('/consultar/ruc/:ruc', customerController.consultarRuc);
router.delete('/:id', customerController.remove);

module.exports = router;
