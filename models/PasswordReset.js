const db = require("../db");
const bcrypt = require("bcrypt");

const PasswordReset = {
  // Código de recuperación
  createResetCode: async (email, code) => {
    try {
      await db.query("CALL CreatePasswordResetCode(?, ?)", [email, code]);
      return { success: true };
    } catch (error) {
      // Capturar errores del procedimiento almacenado
      if (error.sqlState === "45000") {
        return { success: false, message: error.sqlMessage };
      }
      throw error;
    }
  },

  // Verificar si el código es válido
  verifyCodeProcedure: async (email, code) => {
    try {
      await db.query("CALL CheckResetCode(?, ?)", [email, code]);
      return { success: true };
    } catch (error) {
      if (error.sqlState === "45000") {
        return { success: false, message: error.sqlMessage };
      }
      throw error;
    }
  },

  // Actualizar contraseña
  updatePassword: async (email, newPassword) => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await db.query(
        "UPDATE User SET Password = ? WHERE Email = ?",
        [hashedPassword, email]
      );
      
      if (result.affectedRows === 0) {
        throw new Error("Usuario no encontrado");
      }
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Verificar si el usuario existe
  userExists: async (email) => {
    try {
      const [rows] = await db.query("SELECT UserId FROM User WHERE Email = ?", [email]);
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = PasswordReset;