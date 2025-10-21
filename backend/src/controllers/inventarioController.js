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
    const { 
      codigo, nombre, descripcion, categoria,
      precio_compra, precio_venta, stock_actual, stock_minimo, 
      fecha_vencimiento, proveedor_id
    } = req.body;
    
    console.log('📦 Creando producto:', { codigo, nombre, proveedor_id, fecha_vencimiento });
    
    const pool = await getConnection();
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      // Verificar si el código ya existe
      const checkCodigo = await transaction.request()
        .input('codigo', sql.NVarChar, codigo)
        .query('SELECT id FROM Productos WHERE codigo = @codigo');
      
      if (checkCodigo.recordset.length > 0) {
        await transaction.rollback();
        return error(res, 'El código de producto ya existe', 400);
      }

      // Insertar producto
      const productoResult = await transaction.request()
        .input('codigo', sql.NVarChar, codigo)
        .input('nombre', sql.NVarChar, nombre)
        .input('descripcion', sql.NVarChar, descripcion || '')
        .input('categoria', sql.NVarChar, categoria)
        .input('precio_compra', sql.Decimal(10, 2), precio_compra)
        .input('precio_venta', sql.Decimal(10, 2), precio_venta)
        .input('stock_minimo', sql.Int, stock_minimo || 5)
        .input('proveedor_id', sql.Int, proveedor_id || null)
        .query(`
          INSERT INTO Productos (
            codigo, nombre, descripcion, categoria,
            precio_compra, precio_venta, stock_minimo, 
            proveedor_id
          )
          OUTPUT INSERTED.id
          VALUES (
            @codigo, @nombre, @descripcion, @categoria,
            @precio_compra, @precio_venta, @stock_minimo,
            @proveedor_id
          )
        `);
      
      const productoId = productoResult.recordset[0].id;
      console.log('✅ Producto creado con ID:', productoId)
      
      // Insertar en inventario con stock inicial
      const stockInicial = stock_actual || 0;
      await transaction.request()
        .input('producto_id', sql.Int, productoId)
        .input('cantidad', sql.Int, stockInicial)
        .input('fecha_vencimiento', sql.Date, fecha_vencimiento || null)
        .query(`
          INSERT INTO Inventario (producto_id, cantidad_actual, fecha_vencimiento)
          VALUES (@producto_id, @cantidad, @fecha_vencimiento)
        `);

      console.log('✅ Inventario creado con stock:', stockInicial, 'y fecha vencimiento:', fecha_vencimiento || 'N/A');
      
      // Registrar movimiento si hay stock inicial
      if (stockInicial > 0) {
        await transaction.request()
          .input('producto_id', sql.Int, productoId)
          .input('cantidad', sql.Int, stockInicial)
          .input('usuario_id', sql.Int, req.user.id)
          .query(`
            INSERT INTO MovimientosInventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id)
            VALUES (@producto_id, 'Entrada', @cantidad, 'Inventario inicial', @usuario_id)
          `);
        console.log('✅ Movimiento de inventario registrado');
      }
      
      await transaction.commit();
      console.log('✅ Producto creado:', productoId);
      return success(res, { id: productoId }, 'Producto creado exitosamente', 201);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('❌ Error al crear producto:', err);
    return error(res, err.message || 'Error al crear producto');
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, descripcion, categoria,
      precio_compra, precio_venta, stock_minimo, 
      stock_actual, fecha_vencimiento, proveedor_id
    } = req.body;
    
    console.log('📝 Actualizando producto:', id);
    console.log('📋 Datos recibidos:', { nombre, proveedor_id, stock_actual, fecha_vencimiento });
    
    const pool = await getConnection();
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      // Verificar si el producto existe
      const checkProducto = await transaction.request()
        .input('id', sql.Int, id)
        .query('SELECT id FROM Productos WHERE id = @id');
      
      if (checkProducto.recordset.length === 0) {
        await transaction.rollback();
        return notFound(res, 'Producto no encontrado');
      }
      
      // Actualizar tabla Productos (SIN fecha_vencimiento, SIN proveedor_principal)
      const result = await transaction.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, nombre)
        .input('descripcion', sql.NVarChar, descripcion || '')
        .input('categoria', sql.NVarChar, categoria)
        .input('precio_compra', sql.Decimal(10, 2), precio_compra)
        .input('precio_venta', sql.Decimal(10, 2), precio_venta)
        .input('stock_minimo', sql.Int, stock_minimo)
        .input('proveedor_id', sql.Int, proveedor_id || null)
        .query(`
          UPDATE Productos
          SET nombre = @nombre, 
              descripcion = @descripcion, 
              categoria = @categoria,
              precio_compra = @precio_compra, 
              precio_venta = @precio_venta,
              stock_minimo = @stock_minimo,
              proveedor_id = @proveedor_id,
              fecha_actualizacion = GETDATE()
          WHERE id = @id
        `);
      
      console.log('✅ Producto actualizado en tabla Productos');
      
      // Actualizar stock Y fecha_vencimiento en tabla Inventario
      const checkInventario = await transaction.request()
        .input('producto_id', sql.Int, id)
        .query('SELECT cantidad_actual FROM Inventario WHERE producto_id = @producto_id');
      
      if (checkInventario.recordset.length > 0) {
        // Actualizar inventario existente
        await transaction.request()
          .input('producto_id', sql.Int, id)
          .input('cantidad', sql.Int, stock_actual !== undefined ? stock_actual : 0)
          .input('fecha_vencimiento', sql.Date, fecha_vencimiento || null)
          .query(`
            UPDATE Inventario 
            SET cantidad_actual = @cantidad,
                fecha_vencimiento = @fecha_vencimiento,
                ultima_actualizacion = GETDATE()
            WHERE producto_id = @producto_id
          `);
        console.log('✅ Inventario actualizado (stock y fecha vencimiento)');
      } else {
        // Crear registro de inventario si no existe
        await transaction.request()
          .input('producto_id', sql.Int, id)
          .input('cantidad', sql.Int, stock_actual !== undefined ? stock_actual : 0)
          .input('fecha_vencimiento', sql.Date, fecha_vencimiento || null)
          .query(`
            INSERT INTO Inventario (producto_id, cantidad_actual, fecha_vencimiento)
            VALUES (@producto_id, @cantidad, @fecha_vencimiento)
          `);
        console.log('✅ Inventario creado');
      }
      
      await transaction.commit();
      console.log('✅ Transacción completada exitosamente');
      
      return success(res, null, 'Producto actualizado exitosamente');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('❌ Error al actualizar producto:', err);
    return error(res, err.message || 'Error al actualizar producto');
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Eliminando producto:', id);
    
    const pool = await getConnection();
    
    // Verificar si el producto existe
    const checkProducto = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id, codigo, nombre FROM Productos WHERE id = @id');
    
    if (checkProducto.recordset.length === 0) {
      return notFound(res, 'Producto no encontrado');
    }
    
    console.log('📦 Producto a eliminar:', checkProducto.recordset[0]);
    
    // Eliminación lógica (desactivar)
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Productos SET activo = 0, fecha_actualizacion = GETDATE() WHERE id = @id');
    
    console.log('✅ Producto eliminado (desactivado), filas afectadas:', result.rowsAffected[0]);
    
    return success(res, null, 'Producto eliminado exitosamente');
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err);
    return error(res, err.message || 'Error al eliminar producto');
  }
};

const obtenerAlertas = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_AlertasActivas ORDER BY prioridad DESC, fecha_creacion DESC');
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