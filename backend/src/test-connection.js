const {getConnection} = require('./config/database');

const testConnection = async () => {
    try {
        console.log('🔄 Intentando conectar a la base de datos...');
        const pool = await getConnection();
        console.log('✅ ¡Conexión exitosa a SQL Server!');

        // Probar una query simple
        const result = await pool.request().query('SELECT COUNT(*) as total FROM dbo.Usuarios');
        console.log(`✅ Usuarios en la base de datos: ${result.recordset[0].total}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
};

testConnection();