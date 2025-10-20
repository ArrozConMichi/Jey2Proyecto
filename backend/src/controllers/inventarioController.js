const { success, error, notFound } = require('../utils/response');
const { sql, getConnection } = require('../config/database');

const obtenerProductos = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_InventarioCompleto ORDER BY nombre');
    return success(res, result.recordset, 'Productos obtenidos exitosamente');
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al obtener productos');
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM vw_InventarioCompleto WHERE producto_id = @id');
    if (result.recordset.length === 0) {
      return notFound(res, 'Producto no encontrado');
    }
    return success(res, result.recordset[0], 'Producto obtenido');
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al obtener producto');
  }
};

const crearProducto = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoria, precio_compra, precio_venta, 
            es_perecedero, stock_minimo, proveedor_id, cantidad_inicial } = req.body;
    const pool = await getConnection();
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      const productoResult = await transaction.request()
        .input('codigo', sql.NVarChar, codigo)
        .input('nombre', sql.NVarChar, nombre)
        .input('descripcion', sql.NVarChar, descripcion || '')
        .input('categoria', sql.NVarChar, categoria)
        .input('precio_compra', sql.Decimal(10, 2), precio_compra)
        .input('precio_venta', sql.Decimal(10, 2), precio_venta)
        .input('es_perecedero', sql.Bit, es_perecedero || 0)
        .input('stock_minimo', sql.Int, stock_minimo || 5)
        .input('proveedor_id', sql.Int, proveedor_id || null)
        .query(`
          INSERT INTO Productos (codigo, nombre, descripcion, categoria, precio_compra, 
                                 precio_venta, es_perecedero, stock_minimo, proveedor_id)
          OUTPUT INSERTED.id
          VALUES (@codigo, @nombre, @descripcion, @categoria, @precio_compra, 
                  @precio_venta, @es_perecedero, @stock_minimo, @proveedor_id)
        `);
      
      const productoId = productoResult.recordset[0].id;
      
      if (cantidad_inicial && cantidad_inicial > 0) {
        await transaction.request()
          .input('producto_id', sql.Int, productoId)
          .input('cantidad', sql.Int, cantidad_inicial)
          .query(`INSERT INTO Inventario (producto_id, cantidad_actual) VALUES (@producto_id, @cantidad)`);
        
        await transaction.request()
          .input('producto_id', sql.Int, productoId)
          .input('cantidad', sql.Int, cantidad_inicial)
          .input('usuario_id', sql.Int, req.user.id)
          .query(`
            INSERT INTO MovimientosInventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id)
            VALUES (@producto_id, 'Entrada', @cantidad, 'Inventario inicial', @usuario_id)
          `);
      }
      
      await transaction.commit();
      return success(res, { id: productoId }, 'Producto creado', 201);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al crear producto');
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, precio_compra, precio_venta, 
            es_perecedero, stock_minimo, proveedor_id } = req.body;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar, nombre)
      .input('descripcion', sql.NVarChar, descripcion || '')
      .input('categoria', sql.NVarChar, categoria)
      .input('precio_compra', sql.Decimal(10, 2), precio_compra)
      .input('precio_venta', sql.Decimal(10, 2), precio_venta)
      .input('es_perecedero', sql.Bit, es_perecedero)
      .input('stock_minimo', sql.Int, stock_minimo)
      .input('proveedor_id', sql.Int, proveedor_id || null)
      .query(`
        UPDATE Productos
        SET nombre = @nombre, descripcion = @descripcion, categoria = @categoria,
            precio_compra = @precio_compra, precio_venta = @precio_venta,
            es_perecedero = @es_perecedero, stock_minimo = @stock_minimo,
            proveedor_id = @proveedor_id, fecha_actualizacion = GETDATE()
        WHERE id = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return notFound(res, 'Producto no encontrado');
    }
    return success(res, null, 'Producto actualizado');
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al actualizar producto');
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Productos SET activo = 0 WHERE id = @id');
    
    if (result.rowsAffected[0] === 0) {
      return notFound(res, 'Producto no encontrado');
    }
    return success(res, null, 'Producto eliminado');
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al eliminar producto');
  }
};

const obtenerAlertas = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_AlertasActivas ORDER BY prioridad DESC');
    return success(res, result.recordset, 'Alertas obtenidas');
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al obtener alertas');
  }
};

const obtenerStockCritico = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_StockCritico ORDER BY cantidad_faltante DESC');
    return success(res, result.recordset, 'Stock crítico obtenido');
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al obtener stock crítico');
  }
};

const obtenerProximosVencer = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_ProductosPorVencer ORDER BY dias_para_vencer ASC');
    return success(res, result.recordset, 'Productos próximos a vencer obtenidos');
  } catch (err) {
    console.error('Error:', err);
    return error(res, 'Error al obtener productos');
  }
};

const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, tipo_movimiento, motivo } = req.body;
    const pool = await getConnection();
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      const inventarioResult = await transaction.request()
        .input('producto_id', sql.Int, id)
        .query('SELECT cantidad_actual FROM Inventario WHERE producto_id = @producto_id');
      
      if (inventarioResult.recordset.length === 0) {
        await transaction.request()
          .input('producto_id', sql.Int, id)
          .input('cantidad', sql.Int, cantidad)
          .query('INSERT INTO Inventario (producto_id, cantidad_actual) VALUES (@producto_id, @cantidad)');
      } else {
        const stockActual = inventarioResult.recordset[0].cantidad_actual;
        let nuevoStock = tipo_movimiento === 'Entrada' ? stockActual + cantidad :
                        tipo_movimiento === 'Salida' ? stockActual - cantidad : cantidad;
        
        if (nuevoStock < 0) throw new Error('Stock insuficiente');
        
        await transaction.request()
          .input('producto_id', sql.Int, id)
          .input('cantidad', sql.Int, nuevoStock)
          .query('UPDATE Inventario SET cantidad_actual = @cantidad, ultima_actualizacion = GETDATE() WHERE producto_id = @producto_id');
      }
      
      await transaction.request()
        .input('producto_id', sql.Int, id)
        .input('tipo_movimiento', sql.NVarChar, tipo_movimiento)
        .input('cantidad', sql.Int, cantidad)
        .input('motivo', sql.NVarChar, motivo)
        .input('usuario_id', sql.Int, req.user.id)
        .query(`INSERT INTO MovimientosInventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id)
                VALUES (@producto_id, @tipo_movimiento, @cantidad, @motivo, @usuario_id)`);
      
      await transaction.commit();
      return success(res, null, 'Stock actualizado');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error:', err);
    return error(res, err.message === 'Stock insuficiente' ? err.message : 'Error al actualizar stock', 400);
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerAlertas,
  obtenerStockCritico,
  obtenerProximosVencer,
  actualizarStock
};