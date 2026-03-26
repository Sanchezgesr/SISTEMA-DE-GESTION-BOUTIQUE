const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const authMiddleware = require('../middleware/auth');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  }
  next();
};

router.get('/', authMiddleware, adminOnly, userController.getAll);
router.post('/', authMiddleware, adminOnly, userController.create);
router.put('/:id', authMiddleware, adminOnly, userController.update);
router.delete('/:id', authMiddleware, adminOnly, userController.remove);

module.exports = router;
