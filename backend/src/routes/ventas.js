const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.post('/', authenticateToken, authorizeRoles('Jefe', 'Cajero'), ventasController.registrarVenta);
router.get('/', authenticateToken, ventasController.obtenerVentas);
router.get('/:id', authenticateToken, ventasController.obtenerDetalleVenta);

module.exports = router;