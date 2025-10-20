const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.post('/ordenes', authenticateToken, authorizeRoles('Jefe'), comprasController.crearOrdenCompra);
router.get('/ordenes', authenticateToken, comprasController.obtenerOrdenes);
router.get('/proveedores', authenticateToken, comprasController.obtenerProveedores);
router.put('/ordenes/:id/recibir', authenticateToken, authorizeRoles('Jefe', 'Ayudante'), comprasController.recibirOrden);

module.exports = router;