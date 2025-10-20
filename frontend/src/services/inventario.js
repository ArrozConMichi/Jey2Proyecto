import api from './api';

const inventarioService = {
  // Obtener todos los productos
  async obtenerProductos() {
    try {
      const response = await api.get('/inventario/productos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener un producto por ID
  async obtenerProductoPorId(id) {
    try {
      const response = await api.get(`/inventario/productos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Crear producto
  async crearProducto(producto) {
    try {
      const response = await api.post('/inventario/productos', producto);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar producto
  async actualizarProducto(id, producto) {
    try {
      const response = await api.put(`/inventario/productos/${id}`, producto);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Eliminar producto
  async eliminarProducto(id) {
    try {
      const response = await api.delete(`/inventario/productos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar stock
  async actualizarStock(id, datos) {
    try {
      const response = await api.put(`/inventario/productos/${id}/stock`, datos);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener alertas
  async obtenerAlertas() {
    try {
      const response = await api.get('/inventario/alertas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener stock crítico
  async obtenerStockCritico() {
    try {
      const response = await api.get('/inventario/stock-critico');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener productos próximos a vencer
  async obtenerProximosVencer() {
    try {
      const response = await api.get('/inventario/proximos-vencer');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default inventarioService;