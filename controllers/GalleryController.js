const path = require("path");
const fs = require("fs");
const db = require("../db");

exports.getPaginatedImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      "SELECT COUNT(*) AS total FROM MultimediaFile"
    );

    const totalImages = countResult[0].total;
    const totalPages = Math.ceil(totalImages / limit);
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    const validOffset = (validPage - 1) * limit;

    const [images] = await db.query(
      `SELECT FileId, FileName, FilePath, Extension
       FROM MultimediaFile
       ORDER BY FileId DESC
       LIMIT ? OFFSET ?`,
      [limit, validOffset]
    );

    const formattedImages = images.map((img) => ({
      FileId: img.FileId,
      FileName: img.FileName,
      url: `${req.protocol}://${req.get("host")}/${img.FilePath.replace(/\\/g, "/")}`,
      Extension: img.Extension
    }));

    res.json({
      page: validPage,
      limit,
      totalPages,
      totalImages,
      images: formattedImages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1
    });
  } catch (err) {
    console.error("Error en la paginación de imágenes:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const extension = path.extname(file.originalname).toUpperCase().replace(".", "");
    const fileName = file.filename;
    const filePath = file.path.replace(/\\/g, "/");

    const [result] = await db.query(
      "INSERT INTO MultimediaFile (FileName, FilePath, Extension) VALUES (?, ?, ?)",
      [fileName, filePath, extension]
    );

    res.status(201).json({ 
      message: "Archivo subido correctamente", 
      FileId: result.insertId,
      fileName 
    });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT FileId, FileName, FilePath, Extension FROM MultimediaFile ORDER BY FileId DESC"
    );

    const files = rows.map((r) => ({
      ...r,
      url: `${req.protocol}://${req.get("host")}/${r.FilePath.replace(/\\/g, "/")}`
    }));

    res.json(files);
  } catch (err) {
    console.error("Error al listar archivos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.query(
      "SELECT FileId, FileName, FilePath, Extension FROM MultimediaFile WHERE FileId = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const currentImage = rows[0];

    const [prevRows] = await db.query(
      `SELECT FileId FROM MultimediaFile 
       WHERE FileId > ? 
       ORDER BY FileId ASC 
       LIMIT 1`,
      [id]
    );

    const [nextRows] = await db.query(
      `SELECT FileId FROM MultimediaFile 
       WHERE FileId < ? 
       ORDER BY FileId DESC 
       LIMIT 1`,
      [id]
    );

    const [positionRows] = await db.query(
      `SELECT COUNT(*) + 1 AS position 
       FROM MultimediaFile 
       WHERE FileId > ?`,
      [id]
    );

    const [totalRows] = await db.query(
      "SELECT COUNT(*) AS total FROM MultimediaFile"
    );

    res.json({
      FileId: currentImage.FileId,
      FileName: currentImage.FileName,
      FilePath: currentImage.FilePath,
      Extension: currentImage.Extension,
      url: `${req.protocol}://${req.get("host")}/${currentImage.FilePath.replace(/\\/g, "/")}`,
      navigation: {
        prevId: prevRows.length ? prevRows[0].FileId : null,
        nextId: nextRows.length ? nextRows[0].FileId : null,
        currentPosition: positionRows[0].position,
        totalImages: totalRows[0].total,
        hasPrev: prevRows.length > 0,
        hasNext: nextRows.length > 0
      }
    });
  } catch (err) {
    console.error("Error al obtener archivo por id:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const [nextRows] = await db.query(
      `SELECT FileId FROM MultimediaFile 
       WHERE FileId < ? 
       ORDER BY FileId DESC 
       LIMIT 1`,
      [id]
    );

    const [prevRows] = await db.query(
      `SELECT FileId FROM MultimediaFile 
       WHERE FileId > ? 
       ORDER BY FileId ASC 
       LIMIT 1`,
      [id]
    );

    const [rows] = await db.query(
      "SELECT FilePath FROM MultimediaFile WHERE FileId = ?", 
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const filePath = rows[0].FilePath;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query(
      "UPDATE Comments SET MultimediaFileId = NULL, CommentStatus = 'pending' WHERE MultimediaFileId = ?",
      [id]
    );

    await db.query("DELETE FROM MultimediaFile WHERE FileId = ?", [id]);

    let redirectTo = null;
    if (nextRows.length) {
      redirectTo = nextRows[0].FileId;
    } else if (prevRows.length) {
      redirectTo = prevRows[0].FileId;
    }

    const [totalRows] = await db.query(
      "SELECT COUNT(*) AS total FROM MultimediaFile"
    );

    res.json({ 
      message: "Archivo eliminado correctamente",
      redirectTo,
      totalImages: totalRows[0].total,
      isEmpty: totalRows[0].total === 0
    });
  } catch (err) {
    console.error("Error al eliminar archivo:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.deleteAllImages = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT FilePath FROM MultimediaFile");

    for (const row of rows) {
      if (fs.existsSync(row.FilePath)) {
        fs.unlinkSync(row.FilePath);
      }
    }

    await db.query(
      "UPDATE Comments SET MultimediaFileId = NULL, CommentStatus = 'pending' WHERE MultimediaFileId IS NOT NULL"
    );
    await db.query("DELETE FROM MultimediaFile");
    await db.query("ALTER TABLE MultimediaFile AUTO_INCREMENT = 1");

    res.json({ message: "Todos los archivos fueron eliminados" });
  } catch (err) {
    console.error("Error al eliminar todos los archivos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};