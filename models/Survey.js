const db = require("../db");

// Guardar respuestas de una encuesta
async function saveSurvey(eventId, userId, answers) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    for (const [questionId, answerValue] of Object.entries(answers)) {
      await connection.query(
        "INSERT INTO Answers (QuestionId, NumericValue, EventId, UserId) VALUES (?, ?, ?, ?)",
        [questionId, answerValue, eventId, userId]
      );
    }

    await connection.commit();
    return { success: true, message: "Encuesta guardada correctamente" };
    
  } catch (err) {
    await connection.rollback();
    console.error("Error guardando encuesta:", err);
    throw err;
  } finally {
    connection.release();
  }
}

// Obtener todas las respuestas (admin)
async function getAllAnswers() {
  return db.query(`
    SELECT 
    u.Names AS UserName,
    e.EventName AS EventName,
    q.QuestionText AS QuestionText,
    a.NumericValue AS NumericValue
FROM Answers a
INNER JOIN User u ON a.UserId = u.UserId
INNER JOIN Events e ON a.EventId = e.EventId
INNER JOIN Questions q ON a.QuestionId = q.QuestionId
ORDER BY u.Names, e.EventName;

  `);
}

module.exports = { saveSurvey, getAllAnswers };
