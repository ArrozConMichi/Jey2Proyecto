const app = require('./app');
const { getConnection } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    console.log('🔄 Iniciando servidor...');
    console.log('🔄 Conectando a la base de datos...');
    console.log(`📊 DB_SERVER: ${process.env.DB_SERVER}`);
    console.log(`📊 DB_DATABASE: ${process.env.DB_DATABASE}`);
    
    await getConnection();
    console.log('✅ Conexión a SQL Server establecida');

    // Iniciar servidor Express
    const server = app.listen(PORT, () => {
      console.log('================================================');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('================================================');
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('================================================');
    });

    // Evitar que el proceso se cierre
    server.on('error', (error) => {
      console.error('❌ Error en el servidor:', error);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

// Iniciar servidor
console.log('🎬 Ejecutando startServer...');
startServer();