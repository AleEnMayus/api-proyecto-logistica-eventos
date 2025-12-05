const db = require("../db");
const bcrypt = require("bcrypt");

const Account = {
  // Crear usuario con contraseña 
  create: async ({ Names, DocumentType, DocumentNumber, BirthDate, Email, Password, Status = "active", Role = "user" }) => {
    if (!Password) throw new Error("Password is required");
    const hashedPassword = await bcrypt.hash(Password, 10);

    const sql = `
      INSERT INTO User (Names, DocumentType, DocumentNumber, BirthDate, Email, Password, Status, Role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      Names,
      DocumentType,
      DocumentNumber,
      BirthDate,
      Email,
      hashedPassword,
      Status,
      Role
    ]);
    return result.insertId; // devuelve id del usuario creado
  },
  
  findAll: async () => {
    const sql = "SELECT UserId, Names, DocumentType, DocumentNumber, BirthDate, Email, Status, Role FROM User";
    const [rows] = await db.query(sql);
    return rows;
  },

  findById: async (id) => {
    const sql = "SELECT UserId, Names, DocumentType, DocumentNumber, BirthDate, Email, Status, Role FROM User WHERE UserId = ?";
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  update: async (id, { Names, DocumentType, DocumentNumber, BirthDate, Email, Password, Role }) => {
    let sql;
    let params;

    if (Password) {
      const hashedPassword = await bcrypt.hash(Password, 10);
      sql = `
        UPDATE User 
        SET Names = ?, DocumentType = ?, DocumentNumber = ?, BirthDate = ?, Email = ?, Password = ?, Status = ?, Role = ?
        WHERE UserId = ?
      `;
      params = [Names, DocumentType, DocumentNumber, BirthDate, Email, hashedPassword, 'active', Role, id];
    } else {
      sql = `
        UPDATE User 
        SET Names = ?, DocumentType = ?, DocumentNumber = ?, BirthDate = ?, Email = ?, Status = ?, Role = ?
        WHERE UserId = ?
      `;
      params = [Names, DocumentType, DocumentNumber, BirthDate, Email, 'active', Role, id];
    }

    const [result] = await db.query(sql, params);
    return result;
  },

  remove: async (id) => {
    const sql = "DELETE FROM User WHERE UserId = ?";
    const [result] = await db.query(sql, [id]);
    return result;
  },
  // Cambiar estado (activo/inactivo)
  changeStatus: async (id, status) => {
    const sql = "UPDATE User SET Status = ? WHERE UserId = ?";
    const [result] = await db.query(sql, [status, id]);
    return result;
  },

};

module.exports = Account;