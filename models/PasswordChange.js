// models/PasswordChange.js
const db = require("../db");
const bcrypt = require("bcrypt");

const getUserById = async (userId) => {
  const [rows] = await db.query("SELECT * FROM User WHERE UserId = ?", [userId]);
  return rows[0];
};

const updatePassword = async (userId, newPasswordHash) => {
  const [result] = await db.query("UPDATE User SET Password = ? WHERE UserId = ?", [newPasswordHash, userId]);
  return result;
};

// Método para comparar contraseñas
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { getUserById, updatePassword, comparePassword };