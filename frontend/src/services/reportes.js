import api from './api';

export default {
  async obtenerDashboardMetricas() {
    const response = await api.get('/reportes/dashboard');
    return response.data;
  },
  async obtenerVentasPorCategoria() {
    const response = await api.get('/reportes/ventas-categoria');
    return response.data;
  },
  async obtenerProductosMasVendidos() {
    const response = await api.get('/reportes/productos-mas-vendidos');
    return response.data;
  },
  async obtenerVentasDiarias() {
    const response = await api.get('/reportes/ventas-diarias');
    return response.data;
  }
};