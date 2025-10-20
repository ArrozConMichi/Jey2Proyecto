const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/dashboard', authenticateToken, reportesController.obtenerDashboardMetricas);
router.get('/ventas-categoria', authenticateToken, reportesController.obtenerVentasPorCategoria);
router.get('/productos-mas-vendidos', authenticateToken, reportesController.obtenerProductosMasVendidos);
router.get('/ventas-diarias', authenticateToken, reportesController.obtenerVentasDiarias);

module.exports = router;