const db = require("../db");

exports.getImageComments = async (req, res) => {
  try {
    const { id } = req.params;
    const [comments] = await db.query(
      `SELECT c.CommentId, c.CommentText, c.PublicationDate, u.Names as UserName
       FROM Comments c
       LEFT JOIN User u ON c.UserId = u.UserId
       WHERE c.MultimediaFileId = ? AND c.CommentStatus = 'selected'
       ORDER BY c.PublicationDate DESC`,
      [id]
    );
    res.json(comments);
  } catch (err) {
    console.error("Error al obtener comentarios:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getPublicComments = async (req, res) => {
  try {
    const [comments] = await db.query(
      `SELECT 
         CommentId, 
         CommentText, 
         CommentStatus,
         MultimediaFileId,
         PublicationDate
       FROM Comments
       WHERE CommentStatus = 'pending'
       ORDER BY PublicationDate DESC`
    );
    res.json(comments);
  } catch (err) {
    console.error("Error al obtener comentarios públicos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.addCommentToImage = async (req, res) => {
  try {
    const { id } = req.params;
    // Aceptar tanto { text, userId } como { CommentText, UserId }
    const CommentText = req.body.CommentText || req.body.text;
    const UserId = req.body.UserId || req.body.userId;

    // Validar que el comentario no esté vacío
    if (!CommentText || !CommentText.trim()) {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    // Validar que el UserId no sea nulo
    if (!UserId) {
      return res.status(400).json({ error: "Usuario no autenticado" });
    }

    const [images] = await db.query(
      "SELECT FileId FROM MultimediaFile WHERE FileId = ?",
      [id]
    );

    if (!images.length) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    await db.query(
      `INSERT INTO Comments (CommentText, MultimediaFileId, UserId, PublicationDate)
       VALUES (?, ?, ?, NOW())`,
      [CommentText.trim(), id, UserId]
    );

    res.json({ message: "Comentario agregado correctamente" });
  } catch (err) {
    console.error("Error al agregar comentario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.removeCommentFromImage = async (req, res) => {
  try {
    const { commentId } = req.params;

    await db.query(
      `UPDATE Comments 
       SET MultimediaFileId = NULL, CommentStatus = 'rejected' 
       WHERE CommentId = ?`,
      [commentId]
    );

    res.json({ message: "Comentario removido correctamente" });
  } catch (err) {
    console.error("Error al remover comentario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.acceptComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Validar que exista el comentario
    const [existing] = await db.query(
      "SELECT CommentId FROM Comments WHERE CommentId = ?",
      [commentId]
    );

    if (!existing.length) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    // Cambiar estado a 'selected'
    await db.query(
      `UPDATE Comments 
       SET CommentStatus = 'selected' 
       WHERE CommentId = ?`,
      [commentId]
    );

    res.json({ message: "Comentario aceptado correctamente" });
  } catch (err) {
    console.error("Error al aceptar comentario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getPublicComments = async (req, res) => {
  const [comments] = await db.query(`
    SELECT CommentId, CommentText, CommentStatus, MultimediaFileId, PublicationDate
    FROM Comments
    WHERE CommentStatus = 'pending'
    ORDER BY PublicationDate DESC
  `);
  res.json(comments);
};
