const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const inventarioController = require('../controllers/inventarioController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Validaciones
const crearProductoValidation = [
  body('codigo').notEmpty().withMessage('El código es requerido'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('categoria').isIn(['Abarrotes', 'Carnes', 'Licores', 'Varios']).withMessage('Categoría inválida'),
  body('precio_compra').isFloat({ min: 0 }).withMessage('Precio de compra inválido'),
  body('precio_venta').isFloat({ min: 0 }).withMessage('Precio de venta inválido')
];

const actualizarStockValidation = [
  body('cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
  body('tipo_movimiento').isIn(['Entrada', 'Salida', 'Ajuste']).withMessage('Tipo de movimiento inválido'),
  body('motivo').notEmpty().withMessage('El motivo es requerido')
];

// Rutas
router.get('/productos', authenticateToken, inventarioController.obtenerProductos);
router.get('/productos/:id', authenticateToken, inventarioController.obtenerProductoPorId);
router.post('/productos', authenticateToken, authorizeRoles('Jefe', 'Ayudante'), crearProductoValidation, validate, inventarioController.crearProducto);
router.put('/productos/:id', authenticateToken, authorizeRoles('Jefe', 'Ayudante'), inventarioController.actualizarProducto);
router.delete('/productos/:id', authenticateToken, authorizeRoles('Jefe'), inventarioController.eliminarProducto);

router.get('/alertas', authenticateToken, inventarioController.obtenerAlertas);
router.get('/stock-critico', authenticateToken, inventarioController.obtenerStockCritico);
router.get('/proximos-vencer', authenticateToken, inventarioController.obtenerProximosVencer);

router.put('/productos/:id/stock', authenticateToken, authorizeRoles('Jefe', 'Ayudante'), actualizarStockValidation, validate, inventarioController.actualizarStock);

module.exports = router;