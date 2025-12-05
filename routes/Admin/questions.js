// routes/questions.js
const express = require("express");
const router = express.Router();
const {
  getAllQuestions,
  createQuestion,
  createMultipleQuestions,
} = require("../../controllers/QuestionController");

// Rutas principales
router.get("/", getAllQuestions); // obtener todas
router.post("/", createQuestion); // crear una
router.post("/bulk", createMultipleQuestions); // crear varias

module.exports = router;
