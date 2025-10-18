// Respuesta exitosa
const success = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Respuesta de error
const error = (res, message = 'Error en la operación', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

// Respuesta de validación
const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Errores de validación',
    errors
  });
};

// Respuesta no encontrado
const notFound = (res, message = 'Recurso no encontrado') => {
  return res.status(404).json({
    success: false,
    message
  });
};

// Respuesta no autorizado
const unauthorized = (res, message = 'No autorizado') => {
  return res.status(401).json({
    success: false,
    message
  });
};

// Respuesta prohibido
const forbidden = (res, message = 'Acceso prohibido') => {
  return res.status(403).json({
    success: false,
    message
  });
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden
};