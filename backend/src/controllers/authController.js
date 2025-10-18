const Usuario = require('../models/Usuario');
const { generateToken } = require('../config/jwt');
const { success, error, unauthorized } = require('../utils/response');

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findByEmail(email);
    
    if (!usuario) {
      return unauthorized(res, 'Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await Usuario.verifyPassword(password, usuario.password);
    
    if (!isValidPassword) {
      return unauthorized(res, 'Credenciales inválidas');
    }

    // Generar token
    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    });

    // Respuesta exitosa (sin enviar la contraseña)
    return success(res, {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    }, 'Login exitoso');

  } catch (err) {
    console.error('Error en login:', err);
    return error(res, 'Error en el proceso de login');
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id);
    
    if (!usuario) {
      return unauthorized(res, 'Usuario no encontrado');
    }

    return success(res, usuario, 'Perfil obtenido exitosamente');
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    return error(res, 'Error al obtener el perfil');
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Verificar contraseña actual
    const usuario = await Usuario.findByEmail(req.user.email);
    const isValidPassword = await Usuario.verifyPassword(currentPassword, usuario.password);
    
    if (!isValidPassword) {
      return unauthorized(res, 'Contraseña actual incorrecta');
    }

    // Cambiar contraseña
    await Usuario.changePassword(userId, newPassword);

    return success(res, null, 'Contraseña cambiada exitosamente');
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    return error(res, 'Error al cambiar la contraseña');
  }
};

// Verificar token (útil para el frontend)
const verifyToken = async (req, res) => {
  try {
    // Si llegó aquí, el token es válido (pasó por el middleware)
    return success(res, {
      valid: true,
      usuario: req.user
    }, 'Token válido');
  } catch (err) {
    return error(res, 'Error al verificar token');
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
  verifyToken
};