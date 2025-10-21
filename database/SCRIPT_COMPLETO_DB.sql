-- =============================================
-- SISTEMA JEY2 - SCHEMA DE BASE DE DATOS
-- Base de Datos: Jey2DB
-- Motor: MS SQL Server
-- =============================================

-- Crear base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Jey2DB')
BEGIN
    CREATE DATABASE Jey2DB;
END


USE Jey2DB;


-- =============================================
-- TABLA: Usuarios
-- Descripción: Almacena usuarios del sistema
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE Usuarios (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        rol NVARCHAR(20) NOT NULL CHECK (rol IN ('Jefe', 'Cajero', 'Ayudante', 'Conductor')),
        activo BIT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_actualizacion DATETIME DEFAULT GETDATE()
    );
END


-- =============================================
-- TABLA: Proveedores
-- Descripción: Información de proveedores
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Proveedores')
BEGIN
    CREATE TABLE Proveedores (
        id INT PRIMARY KEY IDENTITY(1,1),
        nombre NVARCHAR(200) NOT NULL,
        contacto NVARCHAR(100),
        telefono NVARCHAR(20),
        email NVARCHAR(100),
        direccion NVARCHAR(300),
        terminos_pago NVARCHAR(50) DEFAULT 'Contado',
        activo BIT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_actualizacion DATETIME DEFAULT GETDATE()
    );
END


-- =============================================
-- TABLA: Productos
-- Descripción: Catálogo de productos
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Productos')
BEGIN
    CREATE TABLE Productos (
        id INT PRIMARY KEY IDENTITY(1,1),
        codigo NVARCHAR(50) UNIQUE NOT NULL,
        nombre NVARCHAR(200) NOT NULL,
        descripcion NVARCHAR(500),
        categoria NVARCHAR(50) NOT NULL CHECK (categoria IN ('Abarrotes', 'Carnes', 'Licores', 'Varios')),
        precio_compra DECIMAL(10,2) NOT NULL,
        precio_venta DECIMAL(10,2) NOT NULL,
        es_perecedero BIT DEFAULT 0,
        stock_minimo INT DEFAULT 5,
        proveedor_id INT,
        activo BIT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        fecha_actualizacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id)
    );
END


-- =============================================
-- TABLA: Inventario
-- Descripción: Control de stock actual
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Inventario')
BEGIN
    CREATE TABLE Inventario (
        id INT PRIMARY KEY IDENTITY(1,1),
        producto_id INT NOT NULL,
        cantidad_actual INT DEFAULT 0,
        fecha_vencimiento DATE NULL,
        lote NVARCHAR(50),
        ubicacion NVARCHAR(100) DEFAULT 'Principal',
        ultima_actualizacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (producto_id) REFERENCES Productos(id)
    );
END


-- =============================================
-- TABLA: MovimientosInventario
-- Descripción: Historial de movimientos
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MovimientosInventario')
BEGIN
    CREATE TABLE MovimientosInventario (
        id INT PRIMARY KEY IDENTITY(1,1),
        producto_id INT NOT NULL,
        tipo_movimiento NVARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('Entrada', 'Salida', 'Ajuste')),
        cantidad INT NOT NULL,
        motivo NVARCHAR(200),
        usuario_id INT NOT NULL,
        fecha_movimiento DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (producto_id) REFERENCES Productos(id),
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
    );
END


-- =============================================
-- TABLA: Ventas
-- Descripción: Registro de transacciones de venta
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ventas')
BEGIN
    CREATE TABLE Ventas (
        id INT PRIMARY KEY IDENTITY(1,1),
        numero_factura NVARCHAR(50) UNIQUE NOT NULL,
        usuario_id INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        impuesto DECIMAL(10,2) DEFAULT 0,
        descuento DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        metodo_pago NVARCHAR(20) NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Tarjeta', 'Credito')),
        estado NVARCHAR(20) DEFAULT 'Completada' CHECK (estado IN ('Completada', 'Devuelta', 'Cancelada')),
        fecha_venta DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
    );
END


-- =============================================
-- TABLA: DetalleVentas
-- Descripción: Items de cada venta
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetalleVentas')
BEGIN
    CREATE TABLE DetalleVentas (
        id INT PRIMARY KEY IDENTITY(1,1),
        venta_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES Ventas(id),
        FOREIGN KEY (producto_id) REFERENCES Productos(id)
    );
END


-- =============================================
-- TABLA: OrdenesCompra
-- Descripción: Órdenes de compra a proveedores
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrdenesCompra')
BEGIN
    CREATE TABLE OrdenesCompra (
        id INT PRIMARY KEY IDENTITY(1,1),
        numero_orden NVARCHAR(50) UNIQUE NOT NULL,
        proveedor_id INT NOT NULL,
        usuario_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        estado NVARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Enviada', 'Recibida', 'Cancelada')),
        fecha_orden DATETIME DEFAULT GETDATE(),
        fecha_entrega_esperada DATE NULL,
        fecha_recepcion DATETIME NULL,
        FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id),
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
    );
END


-- =============================================
-- TABLA: DetalleOrdenesCompra
-- Descripción: Items de órdenes de compra
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetalleOrdenesCompra')
BEGIN
    CREATE TABLE DetalleOrdenesCompra (
        id INT PRIMARY KEY IDENTITY(1,1),
        orden_compra_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad_solicitada INT NOT NULL,
        cantidad_recibida INT DEFAULT 0,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (orden_compra_id) REFERENCES OrdenesCompra(id),
        FOREIGN KEY (producto_id) REFERENCES Productos(id)
    );
END


-- =============================================
-- TABLA: AlertasStock
-- Descripción: Alertas de stock bajo o productos por vencer
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AlertasStock')
BEGIN
    CREATE TABLE AlertasStock (
        id INT PRIMARY KEY IDENTITY(1,1),
        producto_id INT NOT NULL,
        tipo_alerta NVARCHAR(20) NOT NULL CHECK (tipo_alerta IN ('StockBajo', 'Vencimiento')),
        mensaje NVARCHAR(300) NOT NULL,
        leida BIT DEFAULT 0,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (producto_id) REFERENCES Productos(id)
    );
END


-- =============================================
-- TABLA: Devoluciones
-- Descripción: Registro de devoluciones de ventas
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Devoluciones')
BEGIN
    CREATE TABLE Devoluciones (
        id INT PRIMARY KEY IDENTITY(1,1),
        venta_id INT NOT NULL,
        usuario_id INT NOT NULL,
        motivo NVARCHAR(300) NOT NULL,
        monto_devuelto DECIMAL(10,2) NOT NULL,
        fecha_devolucion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (venta_id) REFERENCES Ventas(id),
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
    );
END


-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices en Productos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Productos_Codigo')
    CREATE INDEX IX_Productos_Codigo ON Productos(codigo);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Productos_Categoria')
    CREATE INDEX IX_Productos_Categoria ON Productos(categoria);

-- Índices en Ventas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Ventas_Fecha')
    CREATE INDEX IX_Ventas_Fecha ON Ventas(fecha_venta);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Ventas_NumeroFactura')
    CREATE INDEX IX_Ventas_NumeroFactura ON Ventas(numero_factura);

-- Índices en Inventario
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventario_ProductoID')
    CREATE INDEX IX_Inventario_ProductoID ON Inventario(producto_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventario_FechaVencimiento')
    CREATE INDEX IX_Inventario_FechaVencimiento ON Inventario(fecha_vencimiento);

-- Índices en AlertasStock
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AlertasStock_Leida')
    CREATE INDEX IX_AlertasStock_Leida ON AlertasStock(leida);

-- =============================================
-- SISTEMA JEY2 - DATOS INICIALES (SEED)
-- =============================================

USE Jey2DB;

-- =============================================
-- USUARIOS INICIALES
-- Contraseña para todos: "password123" (ya viene hasheada con bcrypt)
-- =============================================

-- Limpiar usuarios existentes (solo para desarrollo)
DELETE FROM Usuarios;
DBCC CHECKIDENT ('Usuarios', RESEED, 0);

INSERT INTO Usuarios (nombre, email, password, rol, activo) VALUES
('Juan Pérez', 'jefe@jey2.com', '$2a$10$xqZ1KN5YKhWz7hGZ7hGZ7OzCz7hGZ7hGZ7hGZ7hGZ7hGZ7hGZ7hG', 'Jefe', 1),
('María González', 'cajera@jey2.com', '$2a$10$xqZ1KN5YKhWz7hGZ7hGZ7OzCz7hGZ7hGZ7hGZ7hGZ7hGZ7hGZ7hG', 'Cajero', 1),
('Carlos Rodríguez', 'ayudante@jey2.com', '$2a$10$xqZ1KN5YKhWz7hGZ7hGZ7OzCz7hGZ7hGZ7hGZ7hGZ7hGZ7hGZ7hG', 'Ayudante', 1),
('Luis Martínez', 'conductor@jey2.com', '$2a$10$xqZ1KN5YKhWz7hGZ7hGZ7OzCz7hGZ7hGZ7hGZ7hGZ7hGZ7hGZ7hG', 'Conductor', 1);

-- =============================================
-- PROVEEDORES INICIALES
-- =============================================

DELETE FROM Proveedores;
DBCC CHECKIDENT ('Proveedores', RESEED, 0);

INSERT INTO Proveedores (nombre, contacto, telefono, email, direccion, terminos_pago, activo) VALUES
('Cervecería Nacional', 'Roberto Sánchez', '6000-1234', 'ventas@cervecerianacional.com', 'Parque Lefevre, Panamá', '30 días', 1),
('Distribuidora La Familia', 'Ana López', '6100-5678', 'pedidos@lafamilia.com', 'Juan Díaz, Panamá', 'Contado', 1),
('Cárnicos del Istmo', 'Pedro Morales', '6200-9012', 'info@carnicosdistmo.com', 'Tocumen, Panamá', '15 días', 1),
('Abarrotes Don José', 'José Ramírez', '6300-3456', 'don.jose@abarrotes.com', 'San Miguelito, Panamá', 'Contado', 1),
('Licores Premium', 'Sandra Torres', '6400-7890', 'contacto@licorespremium.com', 'Vía España, Panamá', '30 días', 1);

-- =============================================
-- PRODUCTOS INICIALES
-- =============================================

DELETE FROM Productos;
DBCC CHECKIDENT ('Productos', RESEED, 0);

-- ABARROTES
INSERT INTO Productos (codigo, nombre, descripcion, categoria, precio_compra, precio_venta, es_perecedero, stock_minimo, proveedor_id, activo) VALUES
('ARR001', 'Arroz 5kg', 'Arroz blanco de primera calidad', 'Abarrotes', 3.50, 5.00, 0, 10, 4, 1),
('ACE001', 'Aceite 1L', 'Aceite vegetal comestible', 'Abarrotes', 2.75, 4.00, 0, 8, 4, 1),
('AZU001', 'Azúcar 2kg', 'Azúcar refinada blanca', 'Abarrotes', 1.80, 2.50, 0, 15, 4, 1),
('SAL001', 'Sal 500g', 'Sal de mesa yodada', 'Abarrotes', 0.50, 0.85, 0, 20, 4, 1),
('FRI001', 'Frijoles 1kg', 'Frijoles rojos secos', 'Abarrotes', 1.20, 2.00, 0, 12, 4, 1),
('PAS001', 'Pasta 500g', 'Pasta de trigo espagueti', 'Abarrotes', 0.90, 1.50, 0, 15, 4, 1),
('LEG001', 'Leche en Polvo 400g', 'Leche en polvo fortificada', 'Abarrotes', 4.50, 6.50, 0, 8, 2, 1),
('CAF001', 'Café 250g', 'Café molido premium', 'Abarrotes', 3.20, 5.00, 0, 10, 2, 1);

-- CARNES
INSERT INTO Productos (codigo, nombre, descripcion, categoria, precio_compra, precio_venta, es_perecedero, stock_minimo, proveedor_id, activo) VALUES
('CAR001', 'Carne de Res 1kg', 'Carne de res fresca de primera', 'Carnes', 5.50, 8.00, 1, 5, 3, 1),
('POL001', 'Pollo Entero 1kg', 'Pollo fresco entero', 'Carnes', 3.00, 4.50, 1, 8, 3, 1),
('CER001', 'Cerdo 1kg', 'Carne de cerdo fresca', 'Carnes', 4.50, 6.50, 1, 5, 3, 1),
('CHO001', 'Chorizo 500g', 'Chorizo de cerdo', 'Carnes', 2.80, 4.00, 1, 6, 3, 1);

-- LICORES
INSERT INTO Productos (codigo, nombre, descripcion, categoria, precio_compra, precio_venta, es_perecedero, stock_minimo, proveedor_id, activo) VALUES
('CRV001', 'Cerveza Atlas 355ml', 'Cerveza nacional lata', 'Licores', 0.70, 1.25, 0, 50, 1, 1),
('CRV002', 'Cerveza Balboa 355ml', 'Cerveza nacional lata', 'Licores', 0.70, 1.25, 0, 50, 1, 1),
('RON001', 'Ron Abuelo 750ml', 'Ron añejo premium', 'Licores', 12.00, 18.00, 0, 10, 5, 1),
('WHI001', 'Whisky Etiqueta Negra 750ml', 'Whisky escocés', 'Licores', 28.00, 42.00, 0, 5, 5, 1),
('VOD001', 'Vodka Absolut 750ml', 'Vodka premium', 'Licores', 15.00, 22.00, 0, 8, 5, 1);

-- VARIOS
INSERT INTO Productos (codigo, nombre, descripcion, categoria, precio_compra, precio_venta, es_perecedero, stock_minimo, proveedor_id, activo) VALUES
('LIM001', 'Detergente 1kg', 'Detergente en polvo', 'Varios', 2.50, 4.00, 0, 10, 2, 1),
('JAB001', 'Jabón de Baño', 'Jabón de tocador', 'Varios', 0.80, 1.50, 0, 15, 2, 1),
('PAP001', 'Papel Higiénico 4 rollos', 'Papel higiénico suave', 'Varios', 2.00, 3.50, 0, 12, 2, 1),
('DEN001', 'Pasta Dental', 'Pasta dental con flúor', 'Varios', 1.80, 3.00, 0, 10, 2, 1);

-- =============================================
-- INVENTARIO INICIAL
-- =============================================

DELETE FROM Inventario;
DBCC CHECKIDENT ('Inventario', RESEED, 0);

-- Abarrotes
INSERT INTO Inventario (producto_id, cantidad_actual, fecha_vencimiento, lote, ubicacion) VALUES
(1, 25, NULL, 'L001', 'Principal'),
(2, 18, NULL, 'L002', 'Principal'),
(3, 30, NULL, 'L003', 'Principal'),
(4, 45, NULL, 'L004', 'Principal'),
(5, 22, NULL, 'L005', 'Principal'),
(6, 28, NULL, 'L006', 'Principal'),
(7, 15, NULL, 'L007', 'Principal'),
(8, 20, NULL, 'L008', 'Principal');

-- Carnes (con fechas de vencimiento cercanas)
INSERT INTO Inventario (producto_id, cantidad_actual, fecha_vencimiento, lote, ubicacion) VALUES
(9, 12, DATEADD(DAY, 5, GETDATE()), 'LC001', 'Refrigerador'),
(10, 20, DATEADD(DAY, 4, GETDATE()), 'LC002', 'Refrigerador'),
(11, 10, DATEADD(DAY, 5, GETDATE()), 'LC003', 'Refrigerador'),
(12, 15, DATEADD(DAY, 8, GETDATE()), 'LC004', 'Refrigerador');

-- Licores
INSERT INTO Inventario (producto_id, cantidad_actual, fecha_vencimiento, lote, ubicacion) VALUES
(13, 100, NULL, 'LL001', 'Bodega'),
(14, 100, NULL, 'LL002', 'Bodega'),
(15, 18, NULL, 'LL003', 'Bodega'),
(16, 8, NULL, 'LL004', 'Bodega'),
(17, 12, NULL, 'LL005', 'Bodega');

-- Varios
INSERT INTO Inventario (producto_id, cantidad_actual, fecha_vencimiento, lote, ubicacion) VALUES
(18, 22, NULL, 'LV001', 'Principal'),
(19, 35, NULL, 'LV002', 'Principal'),
(20, 25, NULL, 'LV003', 'Principal'),
(21, 18, NULL, 'LV004', 'Principal');

-- =============================================
-- ALERTAS DE STOCK BAJO (EJEMPLOS)
-- =============================================

DELETE FROM AlertasStock;
DBCC CHECKIDENT ('AlertasStock', RESEED, 0);

-- Crear algunas alertas de ejemplo para productos con stock bajo
INSERT INTO AlertasStock (producto_id, tipo_alerta, mensaje, leida) VALUES
(16, 'StockBajo', 'El producto "Whisky Etiqueta Negra 750ml" está por debajo del stock mínimo (8 unidades). Stock actual: 8', 0),
(9, 'Vencimiento', 'El producto "Carne de Res 1kg" tiene fecha de vencimiento próxima (5 días)', 0);

-- =============================================
-- VENTA DE EJEMPLO
-- =============================================

DELETE FROM DetalleVentas;
DELETE FROM Ventas;
DBCC CHECKIDENT ('Ventas', RESEED, 0);
DBCC CHECKIDENT ('DetalleVentas', RESEED, 0);

-- Insertar una venta de ejemplo
INSERT INTO Ventas (numero_factura, usuario_id, subtotal, impuesto, descuento, total, metodo_pago, estado, fecha_venta)
VALUES ('FAC-00001', 2, 15.00, 1.05, 0, 16.05, 'Efectivo', 'Completada', GETDATE());

-- Detalles de la venta
INSERT INTO DetalleVentas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 2, 5.00, 10.00),  -- 2 Arroz
(1, 3, 2, 2.50, 5.00);   -- 2 Azúcar

-- =============================================
-- SISTEMA JEY2 - VISTAS SQL COMPLETAS
-- Vistas útiles para reportes y consultas
-- =============================================

USE Jey2DB;

-- =============================================
-- VISTA 1: Inventario Completo
-- Muestra productos con su stock actual y proveedor
-- =============================================
IF OBJECT_ID('vw_InventarioCompleto', 'V') IS NOT NULL
    DROP VIEW vw_InventarioCompleto;


CREATE VIEW vw_InventarioCompleto AS
SELECT
    p.id AS producto_id,
    p.codigo,
    p.nombre,
    p.categoria,
    p.precio_compra,
    p.precio_venta,
    p.es_perecedero,
    p.stock_minimo,
    p.proveedor_id,
    prov.nombre AS proveedor_principal,
    ISNULL(i.cantidad_actual, 0) AS stock_actual,
    i.fecha_vencimiento,
    i.lote,
    i.ubicacion,
    CASE
        WHEN ISNULL(i.cantidad_actual, 0) = 0 THEN 'Sin Stock'
        WHEN ISNULL(i.cantidad_actual, 0) <= p.stock_minimo THEN 'Stock Bajo'
        WHEN i.fecha_vencimiento IS NOT NULL AND DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) <= 7 THEN 'Por Vencer'
        ELSE 'Normal'
    END AS estado_alerta,
    p.activo
FROM Productos p
LEFT JOIN Inventario i ON p.id = i.producto_id
LEFT JOIN Proveedores prov ON p.proveedor_id = prov.id
WHERE p.activo = 1;

-- =============================================
-- VISTA 2: Productos con Stock Crítico
-- Solo productos que necesitan reabastecimiento
-- =============================================
IF OBJECT_ID('vw_StockCritico', 'V') IS NOT NULL
    DROP VIEW vw_StockCritico;


CREATE VIEW vw_StockCritico AS
SELECT 
    p.id AS producto_id,
    p.codigo,
    p.nombre,
    p.categoria,
    p.stock_minimo,
    ISNULL(i.cantidad_actual, 0) AS stock_actual,
    p.stock_minimo - ISNULL(i.cantidad_actual, 0) AS cantidad_faltante,
    prov.id AS proveedor_id,
    prov.nombre AS proveedor,
    prov.telefono AS proveedor_telefono,
    prov.email AS proveedor_email
FROM Productos p
LEFT JOIN Inventario i ON p.id = i.producto_id
LEFT JOIN Proveedores prov ON p.proveedor_id = prov.id
WHERE ISNULL(i.cantidad_actual, 0) <= p.stock_minimo
    AND p.activo = 1;

-- =============================================
-- VISTA 3: Productos Próximos a Vencer
-- Productos perecederos con vencimiento en 7 días o menos
-- =============================================
IF OBJECT_ID('vw_ProductosPorVencer', 'V') IS NOT NULL
    DROP VIEW vw_ProductosPorVencer;


CREATE VIEW vw_ProductosPorVencer AS
SELECT 
    p.id AS producto_id,
    p.codigo,
    p.nombre,
    p.categoria,
    i.cantidad_actual,
    i.fecha_vencimiento,
    DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) AS dias_para_vencer,
    i.lote,
    i.ubicacion,
    CASE 
        WHEN DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) <= 0 THEN 'VENCIDO'
        WHEN DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) <= 3 THEN 'URGENTE'
        WHEN DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) <= 7 THEN 'Próximo a Vencer'
        ELSE 'Normal'
    END AS nivel_urgencia
FROM Productos p
INNER JOIN Inventario i ON p.id = i.producto_id
WHERE p.es_perecedero = 1
    AND i.fecha_vencimiento IS NOT NULL
    AND DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) <= 7
    AND p.activo = 1;

-- =============================================
-- VISTA 4: Resumen de Ventas Diarias
-- Ventas totales por día con métricas
-- =============================================
IF OBJECT_ID('vw_VentasDiarias', 'V') IS NOT NULL
    DROP VIEW vw_VentasDiarias;


CREATE VIEW vw_VentasDiarias AS
SELECT 
    CAST(v.fecha_venta AS DATE) AS fecha,
    COUNT(v.id) AS total_transacciones,
    SUM(v.subtotal) AS subtotal_dia,
    SUM(v.impuesto) AS impuesto_dia,
    SUM(v.descuento) AS descuento_dia,
    SUM(v.total) AS total_dia,
    COUNT(CASE WHEN v.metodo_pago = 'Efectivo' THEN 1 END) AS ventas_efectivo,
    COUNT(CASE WHEN v.metodo_pago = 'Tarjeta' THEN 1 END) AS ventas_tarjeta,
    COUNT(CASE WHEN v.metodo_pago = 'Credito' THEN 1 END) AS ventas_credito,
    AVG(v.total) AS ticket_promedio
FROM Ventas v
WHERE v.estado = 'Completada'
GROUP BY CAST(v.fecha_venta AS DATE);

-- =============================================
-- VISTA 5: Detalle de Ventas con Productos
-- Vista completa de ventas con items vendidos
-- =============================================
IF OBJECT_ID('vw_DetalleVentasCompleto', 'V') IS NOT NULL
    DROP VIEW vw_DetalleVentasCompleto;


CREATE VIEW vw_DetalleVentasCompleto AS
SELECT 
    v.id AS venta_id,
    v.numero_factura,
    v.fecha_venta,
    u.nombre AS cajero,
    v.metodo_pago,
    v.estado,
    dv.id AS detalle_id,
    p.codigo AS producto_codigo,
    p.nombre AS producto_nombre,
    p.categoria,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal AS subtotal_producto,
    v.total AS total_venta
FROM Ventas v
INNER JOIN DetalleVentas dv ON v.id = dv.venta_id
INNER JOIN Productos p ON dv.producto_id = p.id
INNER JOIN Usuarios u ON v.usuario_id = u.id;

-- =============================================
-- VISTA 6: Productos Más Vendidos
-- Top productos por cantidad vendida
-- =============================================
IF OBJECT_ID('vw_ProductosMasVendidos', 'V') IS NOT NULL
    DROP VIEW vw_ProductosMasVendidos;


CREATE VIEW vw_ProductosMasVendidos AS
SELECT 
    p.id AS producto_id,
    p.codigo,
    p.nombre,
    p.categoria,
    SUM(dv.cantidad) AS total_vendido,
    COUNT(DISTINCT v.id) AS numero_transacciones,
    SUM(dv.subtotal) AS ingresos_totales,
    AVG(dv.precio_unitario) AS precio_promedio
FROM Productos p
INNER JOIN DetalleVentas dv ON p.id = dv.producto_id
INNER JOIN Ventas v ON dv.venta_id = v.id
WHERE v.estado = 'Completada'
    AND v.fecha_venta >= DATEADD(MONTH, -1, GETDATE())
GROUP BY p.id, p.codigo, p.nombre, p.categoria;

-- =============================================
-- VISTA 7: Órdenes de Compra Completas
-- Detalle completo de órdenes con proveedor
-- =============================================
IF OBJECT_ID('vw_OrdenesCompraCompletas', 'V') IS NOT NULL
    DROP VIEW vw_OrdenesCompraCompletas;


CREATE VIEW vw_OrdenesCompraCompletas AS
SELECT 
    oc.id AS orden_id,
    oc.numero_orden,
    oc.fecha_orden,
    oc.fecha_entrega_esperada,
    oc.fecha_recepcion,
    oc.estado,
    prov.nombre AS proveedor,
    prov.telefono AS proveedor_telefono,
    prov.email AS proveedor_email,
    u.nombre AS usuario_solicita,
    oc.total AS total_orden,
    COUNT(doc.id) AS total_items,
    SUM(doc.cantidad_solicitada) AS unidades_totales_solicitadas,
    SUM(doc.cantidad_recibida) AS unidades_totales_recibidas,
    CASE 
        WHEN oc.estado = 'Recibida' THEN 'Completa'
        WHEN oc.estado = 'Cancelada' THEN 'Cancelada'
        WHEN oc.fecha_entrega_esperada < GETDATE() AND oc.estado = 'Enviada' THEN 'Atrasada'
        ELSE oc.estado
    END AS estado_detallado
FROM OrdenesCompra oc
INNER JOIN Proveedores prov ON oc.proveedor_id = prov.id
INNER JOIN Usuarios u ON oc.usuario_id = u.id
LEFT JOIN DetalleOrdenesCompra doc ON oc.id = doc.orden_compra_id
GROUP BY oc.id, oc.numero_orden, oc.fecha_orden, oc.fecha_entrega_esperada, 
         oc.fecha_recepcion, oc.estado, prov.nombre, prov.telefono, prov.email,
         u.nombre, oc.total;

-- =============================================
-- VISTA 8: Desempeño de Proveedores
-- Métricas de calidad y puntualidad por proveedor
-- =============================================
IF OBJECT_ID('vw_DesempenoProveedores', 'V') IS NOT NULL
    DROP VIEW vw_DesempenoProveedores;


CREATE VIEW vw_DesempenoProveedores AS
SELECT 
    prov.id AS proveedor_id,
    prov.nombre AS proveedor,
    prov.telefono,
    prov.email,
    COUNT(oc.id) AS total_ordenes,
    COUNT(CASE WHEN oc.estado = 'Recibida' THEN 1 END) AS ordenes_completadas,
    COUNT(CASE WHEN oc.estado = 'Cancelada' THEN 1 END) AS ordenes_canceladas,
    COUNT(CASE WHEN oc.fecha_recepcion > oc.fecha_entrega_esperada THEN 1 END) AS ordenes_atrasadas,
    SUM(oc.total) AS monto_total_comprado,
    AVG(oc.total) AS monto_promedio_orden,
    MAX(oc.fecha_orden) AS ultima_orden,
    CASE 
        WHEN COUNT(oc.id) = 0 THEN 0
        ELSE CAST(COUNT(CASE WHEN oc.estado = 'Recibida' THEN 1 END) AS FLOAT) / COUNT(oc.id) * 100
    END AS porcentaje_cumplimiento
FROM Proveedores prov
LEFT JOIN OrdenesCompra oc ON prov.id = oc.proveedor_id
GROUP BY prov.id, prov.nombre, prov.telefono, prov.email;

-- =============================================
-- VISTA 9: Alertas Activas Resumen
-- Todas las alertas no leídas agrupadas
-- =============================================
IF OBJECT_ID('vw_AlertasActivas', 'V') IS NOT NULL
    DROP VIEW vw_AlertasActivas;


CREATE VIEW vw_AlertasActivas AS
SELECT 
    a.id AS alerta_id,
    a.tipo_alerta,
    p.codigo AS producto_codigo,
    p.nombre AS producto_nombre,
    p.categoria,
    a.mensaje,
    a.fecha_creacion,
    DATEDIFF(HOUR, a.fecha_creacion, GETDATE()) AS horas_desde_creacion,
    CASE 
        WHEN a.tipo_alerta = 'StockBajo' AND ISNULL(i.cantidad_actual, 0) = 0 THEN 'CRÍTICO'
        WHEN a.tipo_alerta = 'Vencimiento' AND DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) <= 0 THEN 'CRÍTICO'
        WHEN a.tipo_alerta = 'Vencimiento' AND DATEDIFF(DAY, GETDATE(), i.fecha_vencimiento) <= 3 THEN 'URGENTE'
        ELSE 'Media'
    END AS prioridad
FROM AlertasStock a
INNER JOIN Productos p ON a.producto_id = p.id
LEFT JOIN Inventario i ON p.id = i.producto_id
WHERE a.leida = 0;

-- =============================================
-- VISTA 10: Movimientos de Inventario Detallado
-- Historial completo de movimientos con usuario
-- =============================================
IF OBJECT_ID('vw_MovimientosInventarioDetallado', 'V') IS NOT NULL
    DROP VIEW vw_MovimientosInventarioDetallado;


CREATE VIEW vw_MovimientosInventarioDetallado AS
SELECT 
    mi.id AS movimiento_id,
    mi.fecha_movimiento,
    mi.tipo_movimiento,
    p.codigo AS producto_codigo,
    p.nombre AS producto_nombre,
    p.categoria,
    mi.cantidad,
    mi.motivo,
    u.nombre AS usuario,
    u.rol AS usuario_rol,
    CASE 
        WHEN mi.tipo_movimiento = 'Entrada' THEN '+'
        WHEN mi.tipo_movimiento = 'Salida' THEN '-'
        ELSE '±'
    END AS signo
FROM MovimientosInventario mi
INNER JOIN Productos p ON mi.producto_id = p.id
INNER JOIN Usuarios u ON mi.usuario_id = u.id;

-- =============================================
-- VISTA 11: Dashboard Principal (Métricas Clave)
-- Vista para el dashboard con KPIs principales
-- =============================================
IF OBJECT_ID('vw_DashboardMetricas', 'V') IS NOT NULL
    DROP VIEW vw_DashboardMetricas;


CREATE VIEW vw_DashboardMetricas AS
SELECT 
    -- Ventas del día
    (SELECT ISNULL(SUM(total), 0) FROM Ventas WHERE CAST(fecha_venta AS DATE) = CAST(GETDATE() AS DATE) AND estado = 'Completada') AS ventas_hoy,
    
    -- Ventas del mes
    (SELECT ISNULL(SUM(total), 0) FROM Ventas WHERE MONTH(fecha_venta) = MONTH(GETDATE()) AND YEAR(fecha_venta) = YEAR(GETDATE()) AND estado = 'Completada') AS ventas_mes,
    
    -- Total de productos en inventario
    (SELECT COUNT(DISTINCT producto_id) FROM Inventario WHERE cantidad_actual > 0) AS productos_en_stock,
    
    -- Productos con stock bajo
    (SELECT COUNT(*) FROM vw_StockCritico) AS productos_stock_bajo,
    
    -- Productos próximos a vencer
    (SELECT COUNT(DISTINCT producto_id) FROM vw_ProductosPorVencer) AS productos_por_vencer,
    
    -- Alertas no leídas
    (SELECT COUNT(*) FROM AlertasStock WHERE leida = 0) AS alertas_pendientes,
    
    -- Órdenes de compra pendientes
    (SELECT COUNT(*) FROM OrdenesCompra WHERE estado IN ('Pendiente', 'Enviada')) AS ordenes_pendientes,
    
    -- Transacciones del día
    (SELECT COUNT(*) FROM Ventas WHERE CAST(fecha_venta AS DATE) = CAST(GETDATE() AS DATE)) AS transacciones_hoy,
    
    -- Valor total del inventario
    (SELECT ISNULL(SUM(i.cantidad_actual * p.precio_compra), 0) FROM Inventario i INNER JOIN Productos p ON i.producto_id = p.id) AS valor_inventario;

-- =============================================
-- VISTA 12: Análisis de Rentabilidad por Producto
-- Margen de ganancia por producto
-- =============================================
IF OBJECT_ID('vw_RentabilidadProductos', 'V') IS NOT NULL
    DROP VIEW vw_RentabilidadProductos;


CREATE VIEW vw_RentabilidadProductos AS
SELECT 
    p.id AS producto_id,
    p.codigo,
    p.nombre,
    p.categoria,
    p.precio_compra,
    p.precio_venta,
    p.precio_venta - p.precio_compra AS margen_unitario,
    CASE 
        WHEN p.precio_compra > 0 THEN ROUND(((p.precio_venta - p.precio_compra) / p.precio_compra * 100), 2)
        ELSE 0
    END AS porcentaje_margen,
    ISNULL(SUM(dv.cantidad), 0) AS unidades_vendidas_total,
    ISNULL(SUM(dv.subtotal), 0) AS ingresos_totales,
    ISNULL(SUM(dv.cantidad * p.precio_compra), 0) AS costo_total,
    ISNULL(SUM(dv.subtotal) - SUM(dv.cantidad * p.precio_compra), 0) AS ganancia_total
FROM Productos p
LEFT JOIN DetalleVentas dv ON p.id = dv.producto_id
LEFT JOIN Ventas v ON dv.venta_id = v.id AND v.estado = 'Completada'
GROUP BY p.id, p.codigo, p.nombre, p.categoria, p.precio_compra, p.precio_venta;

-- =============================================
-- VISTA 13: Ventas por Categoría
-- Análisis de ventas agrupadas por categoría
-- =============================================
IF OBJECT_ID('vw_VentasPorCategoria', 'V') IS NOT NULL
    DROP VIEW vw_VentasPorCategoria;


CREATE VIEW vw_VentasPorCategoria AS
SELECT 
    p.categoria,
    COUNT(DISTINCT dv.venta_id) AS numero_transacciones,
    SUM(dv.cantidad) AS unidades_vendidas,
    SUM(dv.subtotal) AS total_ingresos,
    AVG(dv.precio_unitario) AS precio_promedio,
    COUNT(DISTINCT p.id) AS productos_diferentes_vendidos
FROM Productos p
INNER JOIN DetalleVentas dv ON p.id = dv.producto_id
INNER JOIN Ventas v ON dv.venta_id = v.id
WHERE v.estado = 'Completada'
    AND v.fecha_venta >= DATEADD(MONTH, -1, GETDATE())
GROUP BY p.categoria;

-- =============================================
-- VISTA 14: Historial de Devoluciones
-- Detalle completo de devoluciones
-- =============================================
IF OBJECT_ID('vw_HistorialDevoluciones', 'V') IS NOT NULL
    DROP VIEW vw_HistorialDevoluciones;


CREATE VIEW vw_HistorialDevoluciones AS
SELECT 
    d.id AS devolucion_id,
    d.fecha_devolucion,
    v.numero_factura,
    v.fecha_venta,
    v.total AS monto_venta_original,
    d.monto_devuelto,
    d.motivo,
    u.nombre AS usuario_autoriza,
    cajero.nombre AS cajero_venta_original
FROM Devoluciones d
INNER JOIN Ventas v ON d.venta_id = v.id
INNER JOIN Usuarios u ON d.usuario_id = u.id
INNER JOIN Usuarios cajero ON v.usuario_id = cajero.id;