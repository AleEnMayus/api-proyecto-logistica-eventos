const db = require("../db");
const bcrypt = require("bcrypt");

const auth = {
  findByEmailOrDocument: async (email, documentNumber) => {
    const [rows] = await db.query(
      "SELECT * FROM User WHERE Email = ? OR DocumentNumber = ?",
      [email, documentNumber]
    );
    return rows;
  },

  findByEmail: async (email) => {
    const [rows] = await db.query(
      "SELECT * FROM User WHERE Email = ?",
      [email]
    );
    return rows[0];
  },

  findById: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM User WHERE UserId = ?",
      [userId]
    );
    return rows[0];
  },

  create: async ({ fullName, identificationType, documentNumber, birthDate, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO User (Names, DocumentType, DocumentNumber, BirthDate, Email, Password, Status, Role)
        VALUES (?, ?, ?, ?, ?, ?, 'active', 'user')`,
      [fullName, identificationType, documentNumber, birthDate, email, hashedPassword]
    );
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  updatePassword: async (userId, newPasswordHash) => {
    const [result] = await db.query(
      "UPDATE User SET Password = ? WHERE UserId = ?",
      [newPasswordHash, userId]
    );
    return result;
  },
};

module.exports = auth;