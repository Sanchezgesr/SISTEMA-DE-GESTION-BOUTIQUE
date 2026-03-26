const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authController } = require('../controllers');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validator');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un email válido',
    'any.required': 'El email es obligatorio'
  }),
  password: Joi.string().min(4).required().messages({
    'string.min': 'La contraseña debe tener al menos 4 caracteres',
    'any.required': 'La contraseña es obligatoria'
  })
});

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
