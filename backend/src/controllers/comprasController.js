const { success, error } = require('../utils/response');
const { sql, getConnection } = require('../config/database');

// Crear orden de compra
const crearOrdenCompra = async (req, res) => {
  try {
    const { proveedor_id, items, fecha_entrega_esperada } = req.body;
    const pool = await getConnection();
    const transaction = pool.transaction();
    
    await transaction.begin();
    
    try {
      const numeroOrden = `OC-${Date.now()}`;
      const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
      
      // Crear orden
      const ordenResult = await transaction.request()
        .input('numero_orden', sql.NVarChar, numeroOrden)
        .input('proveedor_id', sql.Int, proveedor_id)
        .input('usuario_id', sql.Int, req.user.id)
        .input('total', sql.Decimal(10, 2), total)
        .input('fecha_entrega', sql.Date, fecha_entrega_esperada)
        .query(`
          INSERT INTO OrdenesCompra (numero_orden, proveedor_id, usuario_id, total, fecha_entrega_esperada)
          OUTPUT INSERTED.id
          VALUES (@numero_orden, @proveedor_id, @usuario_id, @total, @fecha_entrega)
        `);
      
      const ordenId = ordenResult.recordset[0].id;
      
      // Insertar detalles
      for (const item of items) {
        await transaction.request()
          .input('orden_id', sql.Int, ordenId)
          .input('producto_id', sql.Int, item.producto_id)
          .input('cantidad', sql.Int, item.cantidad)
          .input('precio', sql.Decimal(10, 2), item.precio_unitario)
          .input('subtotal', sql.Decimal(10, 2), item.cantidad * item.precio_unitario)
          .query(`
            INSERT INTO DetalleOrdenesCompra (orden_compra_id, producto_id, cantidad_solicitada, precio_unitario, subtotal)
            VALUES (@orden_id, @producto_id, @cantidad, @precio, @subtotal)
          `);
      }
      
      await transaction.commit();
      
      return success(res, { orden_id: ordenId, numero_orden: numeroOrden }, 'Orden creada exitosamente', 201);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error al crear orden:', err);
    return error(res, 'Error al crear orden de compra');
  }
};

// Obtener órdenes de compra
const obtenerOrdenes = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM vw_OrdenesCompraCompletas ORDER BY fecha_orden DESC');
    
    return success(res, result.recordset, 'Órdenes obtenidas');
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    return error(res, 'Error al obtener órdenes');
  }
};

// Obtener proveedores
const obtenerProveedores = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM Proveedores WHERE activo = 1 ORDER BY nombre');
    
    return success(res, result.recordset, 'Proveedores obtenidos');
  } catch (err) {
    console.error('Error al obtener proveedores:', err);
    return error(res, 'Error al obtener proveedores');
  }
};

// Recibir orden de compra
const recibirOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const pool = await getConnection();
    const transaction = pool.transaction();
    
    await transaction.begin();
    
    try {
      // Actualizar estado de orden
      await transaction.request()
        .input('id', sql.Int, id)
        .query(`
          UPDATE OrdenesCompra 
          SET estado = 'Recibida', fecha_recepcion = GETDATE()
          WHERE id = @id
        `);
      
      // Actualizar cantidades recibidas y stock
      for (const item of items) {
        await transaction.request()
          .input('orden_id', sql.Int, id)
          .input('producto_id', sql.Int, item.producto_id)
          .input('cantidad', sql.Int, item.cantidad_recibida)
          .query(`
            UPDATE DetalleOrdenesCompra 
            SET cantidad_recibida = @cantidad
            WHERE orden_compra_id = @orden_id AND producto_id = @producto_id
          `);
        
        // Actualizar inventario
        await transaction.request()
          .input('producto_id', sql.Int, item.producto_id)
          .input('cantidad', sql.Int, item.cantidad_recibida)
          .query(`
            UPDATE Inventario 
            SET cantidad_actual = cantidad_actual + @cantidad,
                ultima_actualizacion = GETDATE()
            WHERE producto_id = @producto_id
          `);
        
        // Registrar movimiento
        await transaction.request()
          .input('producto_id', sql.Int, item.producto_id)
          .input('cantidad', sql.Int, item.cantidad_recibida)
          .input('usuario_id', sql.Int, req.user.id)
          .query(`
            INSERT INTO MovimientosInventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id)
            VALUES (@producto_id, 'Entrada', @cantidad, 'Recepción orden de compra', @usuario_id)
          `);
      }
      
      await transaction.commit();
      
      return success(res, null, 'Orden recibida exitosamente');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error al recibir orden:', err);
    return error(res, 'Error al recibir orden');
  }
};

module.exports = {
  crearOrdenCompra,
  obtenerOrdenes,
  obtenerProveedores,
  recibirOrden
};