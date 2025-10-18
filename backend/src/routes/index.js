const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
// Aquí irán las demás rutas conforme las vayamos creando
// const inventarioRoutes = require('./inventario');
// const ventasRoutes = require('./ventas');
// const comprasRoutes = require('./compras');
// const reportesRoutes = require('./reportes');

// Ruta raíz de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Sistema Jey2 funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      inventario: '/api/inventario',
      ventas: '/api/ventas',
      compras: '/api/compras',
      reportes: '/api/reportes'
    }
  });
});

// Registrar rutas
router.use('/auth', authRoutes);
// router.use('/inventario', inventarioRoutes);
// router.use('/ventas', ventasRoutes);
// router.use('/compras', comprasRoutes);
// router.use('/reportes', reportesRoutes);

module.exports = router;