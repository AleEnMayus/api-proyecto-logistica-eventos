// models/Question.js
const db = require("../db"); // conexión MySQL

const Question = {
  // Obtener todas las preguntas
  async findAll() {
    const [rows] = await db.query("SELECT * FROM questions ORDER BY QuestionId ASC");
    return rows;
  },

  // Crear una nueva pregunta
  async create(QuestionText) {
    const [result] = await db.query("INSERT INTO questions (QuestionText) VALUES (?)", [QuestionText]);
    return { id: result.insertId, QuestionText };
  },

  // Actualización de una pregunta existente
  async update(QuestionId, QuestionText) {
    const [result] = await db.query(
      "UPDATE questions SET QuestionText = ? WHERE QuestionId = ?",
      [QuestionText, QuestionId]
    );
    return result.affectedRows > 0;
  },

  // Eliminar una pregunta
  async remove(QuestionId) {
    const [result] = await db.query("DELETE FROM questions WHERE QuestionId = ?", [QuestionId]);
    return result.affectedRows > 0;
  },
};

module.exports = Question;
