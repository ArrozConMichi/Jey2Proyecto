const { success, error } = require('../utils/response');
const { sql, getConnection } = require('../config/database');

// Dashboard métricas
const obtenerDashboardMetricas = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_DashboardMetricas');
    
    return success(res, result.recordset[0], 'Métricas obtenidas');
  } catch (err) {
    console.error('Error al obtener métricas:', err);
    return error(res, 'Error al obtener métricas');
  }
};

// Ventas por categoría
const obtenerVentasPorCategoria = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_VentasPorCategoria');
    
    return success(res, result.recordset, 'Ventas por categoría obtenidas');
  } catch (err) {
    console.error('Error al obtener ventas por categoría:', err);
    return error(res, 'Error al obtener datos');
  }
};

// Productos más vendidos
const obtenerProductosMasVendidos = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT TOP 10 * FROM vw_ProductosMasVendidos ORDER BY total_vendido DESC');
    
    return success(res, result.recordset, 'Productos más vendidos obtenidos');
  } catch (err) {
    console.error('Error al obtener productos más vendidos:', err);
    return error(res, 'Error al obtener datos');
  }
};

// Ventas diarias (últimos 30 días)
const obtenerVentasDiarias = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM vw_VentasDiarias 
        WHERE fecha >= DATEADD(DAY, -30, GETDATE())
        ORDER BY fecha DESC
      `);
    
    return success(res, result.recordset, 'Ventas diarias obtenidas');
  } catch (err) {
    console.error('Error al obtener ventas diarias:', err);
    return error(res, 'Error al obtener datos');
  }
};

module.exports = {
  obtenerDashboardMetricas,
  obtenerVentasPorCategoria,
  obtenerProductosMasVendidos,
  obtenerVentasDiarias
};