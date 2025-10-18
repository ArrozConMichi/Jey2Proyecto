const sql = require('mssql');
require('dotenv').config();

// Configuración de la conexión a MS SQL Server
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Pool de conexiones (singleton)
let poolPromise;

const getConnection = async () => {
    try {
        if (!poolPromise) {
            poolPromise = sql.connect(config);
            console.log('✅ Pool de conexiones a SQL Server creado');
        }
        return await poolPromise;
    } catch (error) {
        console.error('❌ Error al conectar con SQL Server:', error);
        throw error;
    }
};

// Función para ejecutar queries
const executeQuery = async (query, params = {}) => {
    try {
        const pool = await getConnection();
        const request = pool.request();

        // Agregar parámetros si existen
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });

        const result = await request.query(query);
        return result;
    } catch (error) {
        console.error('❌ Error ejecutando query:', error);
        throw error;
    }
};

// Función para cerrar la conexión (útil para testing)
const closeConnection = async () => {
  try {
    if (poolPromise) {
      await (await poolPromise).close();
      poolPromise = null;
      console.log('✅ Conexión a SQL Server cerrada');
    }
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error);
    throw error;
  }
};

module.exports = {
  sql,
  getConnection,
  executeQuery,
  closeConnection
};