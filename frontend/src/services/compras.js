import api from './api';

export default {
  async crearOrden(orden) {
    const response = await api.post('/compras/ordenes', orden);
    return response.data;
  },
  async obtenerOrdenes() {
    const response = await api.get('/compras/ordenes');
    return response.data;
  },
  async obtenerProveedores() {
    const response = await api.get('/compras/proveedores');
    return response.data;
  },
  async recibirOrden(id, items) {
    const response = await api.put(`/compras/ordenes/${id}/recibir`, { items });
    return response.data;
  }
};