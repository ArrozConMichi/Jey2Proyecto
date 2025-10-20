import api from './api';

const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, usuario } = response.data.data;
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        
        return { success: true, usuario };
      }
      
      return { success: false, message: 'Error en el login' };
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión';
      return { success: false, message };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtener token
  getToken() {
    return localStorage.getItem('token');
  },

  // Verificar token en el servidor
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data.success;
    } catch (error) {
      return false;
    }
  },

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        const usuario = response.data.data;
        localStorage.setItem('user', JSON.stringify(usuario));
        return { success: true, usuario };
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
};

export default authService;