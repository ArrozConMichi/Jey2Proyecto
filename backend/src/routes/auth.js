const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Validaciones
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

// Rutas públicas
router.post('/login', loginValidation, validate, authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, validate, authController.changePassword);
router.get('/verify', authenticateToken, authController.verifyToken);

module.exports = router;