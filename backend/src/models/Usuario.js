const { sql, getConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Usuarios WHERE email = @email AND activo = 1');
      
      return result.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, nombre, email, rol, activo, fecha_creacion FROM Usuarios WHERE id = @id');
      
      return result.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios
  static async findAll() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query('SELECT id, nombre, email, rol, activo, fecha_creacion, fecha_actualizacion FROM Usuarios ORDER BY nombre');
      
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      const { nombre, email, password, rol } = userData;
      
      // Verificar si el email ya existe
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const pool = await getConnection();
      const result = await pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('rol', sql.NVarChar, rol)
        .query(`
          INSERT INTO Usuarios (nombre, email, password, rol)
          OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol
          VALUES (@nombre, @email, @password, @rol)
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, userData) {
    try {
      const { nombre, email, rol, activo } = userData;

      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, nombre)
        .input('email', sql.NVarChar, email)
        .input('rol', sql.NVarChar, rol)
        .input('activo', sql.Bit, activo)
        .query(`
          UPDATE Usuarios
          SET nombre = @nombre,
              email = @email,
              rol = @rol,
              activo = @activo,
              fecha_actualizacion = GETDATE()
          WHERE id = @id
        `);
      
      if (result.rowsAffected[0] === 0) {
        throw new Error('Usuario no encontrado');
      }

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Cambiar contraseña
  static async changePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const pool = await getConnection();
      await pool.request()
        .input('id', sql.Int, id)
        .input('password', sql.NVarChar, hashedPassword)
        .query(`
          UPDATE Usuarios
          SET password = @password,
              fecha_actualizacion = GETDATE()
          WHERE id = @id
        `);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario (soft delete)
  static async delete(id) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE Usuarios SET activo = 0 WHERE id = @id');
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Usuario;