const { sql, getConnection } = require('../config/database');

class Producto {
  static async findAll() {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_InventarioCompleto WHERE activo = 1 ORDER BY nombre');
    return result.recordset;
  }

  static async findById(id) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM vw_InventarioCompleto WHERE producto_id = @id');
    return result.recordset[0] || null;
  }

  static async buscar(termino) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('termino', sql.NVarChar, `%${termino}%`)
      .query(`
        SELECT * FROM vw_InventarioCompleto 
        WHERE activo = 1 AND (nombre LIKE @termino OR codigo LIKE @termino)
        ORDER BY nombre
      `);
    return result.recordset;
  }
}

module.exports = Producto;