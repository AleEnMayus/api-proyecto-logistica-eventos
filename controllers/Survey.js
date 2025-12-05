const db = require("../db");
const Survey = require("../models/Survey"); // Modelo de encuesta

// Enviar encuesta
const submitSurvey = async (req, res) => {
  try {
    const { EventId, UserId, Answers } = req.body;

    if (!EventId || !UserId || !Answers || Object.keys(Answers).length === 0) {
      return res.status(400).json({ error: "Faltan datos en la encuesta" });
    }

    // Validar que el usuario exista directamente en la DB
    const [userRows] = await db.query("SELECT UserId FROM User WHERE UserId = ?", [UserId]);
    if (!userRows || userRows.length === 0) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    // Validar que el evento exista directamente en la DB
    const [eventRows] = await db.query("SELECT EventId FROM Events WHERE EventId = ?", [EventId]);
    if (!eventRows || eventRows.length === 0) {
      return res.status(400).json({ error: "Evento no existe" });
    }

    // Validar que las preguntas existan en la DB
    const questionIds = Object.keys(Answers);
    if (questionIds.length === 0) {
      return res.status(400).json({ error: "No hay respuestas válidas" });
    }

    const [existingQuestions] = await db.query(
      `SELECT QuestionId FROM Questions WHERE QuestionId IN (${questionIds.map(() => "?").join(",")})`,
      questionIds
    );

    if (existingQuestions.length !== questionIds.length) {
      return res.status(400).json({ error: "Alguna pregunta no existe" });
    }

    // Guardar cada respuesta
    const insertValues = questionIds.map(qid => [
      Answers[qid],
      EventId,
      UserId,
      qid
    ]);

    const sql = `
      INSERT INTO Answers (NumericValue, EventId, UserId, QuestionId)
      VALUES ${insertValues.map(() => "(?, ?, ?, ?)").join(",")}
      ON DUPLICATE KEY UPDATE NumericValue = VALUES(NumericValue)
    `;

    const flatValues = insertValues.flat();
    const [result] = await db.query(sql, flatValues);

    res.status(201).json({
      message: "Encuesta guardada con éxito",
      result,
    });

  } catch (err) {
    console.error("Error al guardar encuesta:", err);

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Usuario, evento o pregunta no válido" });
    }

    res.status(500).json({ error: "Error interno al guardar encuesta" });
  }
};

// Obtener todas las respuestas (admin)
const getAllAnswers = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        a.AnswerId,
        u.Names AS UserName,
        e.EventName AS EventName,
        q.QuestionText,
        a.NumericValue
      FROM Answers a
      INNER JOIN User u ON a.UserId = u.UserId
      INNER JOIN Events e ON a.EventId = e.EventId
      INNER JOIN Questions q ON a.QuestionId = q.QuestionId
      ORDER BY u.Names, e.EventName;
    `);

    res.json(results);
  } catch (err) {
    console.error("Error al obtener respuestas:", err);
    res.status(500).json({ error: "Error interno al obtener respuestas" });
  }
};

module.exports = { submitSurvey, getAllAnswers };
