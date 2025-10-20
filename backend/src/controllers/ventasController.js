const { success, error } = require('../utils/response');
const { sql, getConnection } = require('../config/database');

// Registrar nueva venta
const registrarVenta = async (req, res) => {
  try {
    const { items, metodo_pago, subtotal, impuesto, descuento, total } = req.body;
    const pool = await getConnection();
    const transaction = pool.transaction();
    
    await transaction.begin();
    
    try {
      // 1. Generar número de factura
      const numeroFactura = `FAC-${Date.now()}`;
      
      // 2. Crear venta
      const ventaResult = await transaction.request()
        .input('numero_factura', sql.NVarChar, numeroFactura)
        .input('usuario_id', sql.Int, req.user.id)
        .input('subtotal', sql.Decimal(10, 2), subtotal)
        .input('impuesto', sql.Decimal(10, 2), impuesto)
        .input('descuento', sql.Decimal(10, 2), descuento)
        .input('total', sql.Decimal(10, 2), total)
        .input('metodo_pago', sql.NVarChar, metodo_pago)
        .query(`
          INSERT INTO Ventas (numero_factura, usuario_id, subtotal, impuesto, descuento, total, metodo_pago)
          OUTPUT INSERTED.id
          VALUES (@numero_factura, @usuario_id, @subtotal, @impuesto, @descuento, @total, @metodo_pago)
        `);
      
      const ventaId = ventaResult.recordset[0].id;
      
      // 3. Insertar detalles y actualizar inventario
      for (const item of items) {
        // Insertar detalle
        await transaction.request()
          .input('venta_id', sql.Int, ventaId)
          .input('producto_id', sql.Int, item.producto_id)
          .input('cantidad', sql.Int, item.cantidad)
          .input('precio_unitario', sql.Decimal(10, 2), item.precio_unitario)
          .input('subtotal', sql.Decimal(10, 2), item.subtotal)
          .query(`
            INSERT INTO DetalleVentas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
            VALUES (@venta_id, @producto_id, @cantidad, @precio_unitario, @subtotal)
          `);
        
        // Actualizar inventario
        await transaction.request()
          .input('producto_id', sql.Int, item.producto_id)
          .input('cantidad', sql.Int, item.cantidad)
          .query(`
            UPDATE Inventario 
            SET cantidad_actual = cantidad_actual - @cantidad,
                ultima_actualizacion = GETDATE()
            WHERE producto_id = @producto_id
          `);
        
        // Registrar movimiento
        await transaction.request()
          .input('producto_id', sql.Int, item.producto_id)
          .input('cantidad', sql.Int, item.cantidad)
          .input('usuario_id', sql.Int, req.user.id)
          .query(`
            INSERT INTO MovimientosInventario (producto_id, tipo_movimiento, cantidad, motivo, usuario_id)
            VALUES (@producto_id, 'Salida', @cantidad, 'Venta ${numeroFactura}', @usuario_id)
          `);
      }
      
      await transaction.commit();
      
      return success(res, { venta_id: ventaId, numero_factura: numeroFactura }, 'Venta registrada exitosamente', 201);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error al registrar venta:', err);
    return error(res, 'Error al registrar venta');
  }
};

// Obtener historial de ventas
const obtenerVentas = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT v.*, u.nombre as cajero
        FROM Ventas v
        INNER JOIN Usuarios u ON v.usuario_id = u.id
        ORDER BY v.fecha_venta DESC
      `);
    
    return success(res, result.recordset, 'Ventas obtenidas');
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    return error(res, 'Error al obtener ventas');
  }
};

// Obtener detalle de una venta
const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM vw_DetalleVentasCompleto WHERE venta_id = @id');
    
    return success(res, result.recordset, 'Detalle de venta obtenido');
  } catch (err) {
    console.error('Error al obtener detalle:', err);
    return error(res, 'Error al obtener detalle de venta');
  }
};

module.exports = {
  registrarVenta,
  obtenerVentas,
  obtenerDetalleVenta
};