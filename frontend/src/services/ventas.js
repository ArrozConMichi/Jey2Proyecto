import api from './api';

export default {
  async registrarVenta(venta) {
    const response = await api.post('/ventas', venta);
    return response.data;
  },
  async obtenerVentas() {
    const response = await api.get('/ventas');
    return response.data;
  },
  async obtenerDetalleVenta(id) {
    const response = await api.get(`/ventas/${id}`);
    return response.data;
  }
};