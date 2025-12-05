// controllers/QuestionController.js
const Question = require("../models/Question");
const db = require("../db");

// Obtener todas las preguntas
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll();
    res.json(questions);
  } catch (err) {
    console.error("Error al obtener preguntas:", err);
    res.status(500).json({ error: "Error al obtener preguntas" });
  }
};

// Crear una nueva pregunta
const createQuestion = async (req, res) => {
  try {
    const { QuestionText } = req.body;

    if (!QuestionText || !QuestionText.trim()) {
      return res.status(400).json({ error: "El texto de la pregunta es obligatorio" });
    }

    const newQuestion = await Question.create(QuestionText.trim());
    res.status(201).json({ message: "Pregunta creada con éxito", question: newQuestion });
  } catch (err) {
    console.error("Error al crear pregunta:", err);
    res.status(500).json({ error: "Error al crear la pregunta" });
  }
};

// Actualizar pregunta
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { QuestionText } = req.body;

    if (!QuestionText || !QuestionText.trim()) {
      return res.status(400).json({ error: "El texto de la pregunta es obligatorio" });
    }

    const updated = await Question.update(id, QuestionText.trim());
    if (!updated) return res.status(404).json({ error: "Pregunta no encontrada" });

    res.json({ message: "Pregunta actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar pregunta:", err);
    res.status(500).json({ error: "Error al actualizar la pregunta" });
  }
};

// Eliminar pregunta
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.remove(id);
    if (!deleted) return res.status(404).json({ error: "Pregunta no encontrada" });

    res.json({ message: "Pregunta eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar pregunta:", err);
    res.status(500).json({ error: "Error al eliminar la pregunta" });
  }
};

// Crear varias preguntas a la vez
const createMultipleQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Debes enviar un array de preguntas" });
    }

    // Verificar límite (máximo 5 preguntas)
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM questions");
    const total = rows[0].total;

    if (total + questions.length > 5) {
      return res.status(400).json({
        error: `Solo puedes tener 5 preguntas en total. Ya tienes ${total}, intentas agregar ${questions.length}`,
      });
    }

    const values = questions.map((q) => [q.trim()]);
    await db.query("INSERT INTO questions (QuestionText) VALUES ?", [values]);

    res.status(201).json({ message: "Preguntas agregadas con éxito" });
  } catch (err) {
    console.error("Error al crear varias preguntas:", err);
    res.status(500).json({ error: "Error al guardar las preguntas" });
  }
};

module.exports = {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createMultipleQuestions,
};
