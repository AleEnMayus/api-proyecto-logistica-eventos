const path = require("path");
const fs = require("fs");
const db = require("../db");

// Helper para obtener la URL base correcta
const getBaseUrl = () => {
  return process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
};

// ===============================
// OBTENER FOTO DE PERFIL
// ===============================
exports.getProfileImage = async (req, res) => {
  try {
    const { UserId } = req.params;
    if (!UserId) return res.status(400).json({ error: "UserId es requerido" });

    const [rows] = await db.query("SELECT Photo FROM User WHERE UserId = ?", [UserId]);
    if (!rows.length || !rows[0].Photo) {
      return res.status(404).json({ error: "No se encontró imagen de perfil" });
    }

    let photoPath = rows[0].Photo.replace(/\\/g, "/");

    // Si ya es una URL absoluta, devolver tal cual
    if (/^https?:\/\//i.test(photoPath)) {
      return res.json({ url: photoPath });
    }

    // Construir la URL usando BASE_URL
    const baseUrl = getBaseUrl();
    const cleaned = photoPath.replace(/^\/+/, "");
    const url = `${baseUrl}/${cleaned}`;

    return res.json({ url });
  } catch (err) {
    console.error("Error en getProfileImage:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ===============================
// SUBIR / ACTUALIZAR FOTO DE PERFIL
// ===============================
exports.uploadImage = async (req, res) => {
  try {
    const { file } = req;
    const { UserId } = req.params;

    if (!file) return res.status(400).json({ error: "No se envió ningún archivo" });
    if (!UserId) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ error: "UserId es requerido en la ruta" });
    }

    const filePath = file.path.replace(/\\/g, "/");
    const baseUrl = getBaseUrl();
    const cleanedPath = filePath.replace(/^\/+/, "");
    const fileUrl = `${baseUrl}/${cleanedPath}`;

    // Verificar existencia del usuario
    const [rows] = await db.query("SELECT Photo FROM User WHERE UserId = ?", [UserId]);
    if (!rows.length) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const previousPhoto = rows[0].Photo;

    // Actualizar la ruta en la base de datos
    await db.query("UPDATE User SET Photo = ? WHERE UserId = ?", [filePath, UserId]);

    // Intentar eliminar la foto anterior
    if (previousPhoto) {
      try {
        let prevPath = previousPhoto.replace(/\\/g, "/");

        // Si es una URL absoluta, extraer la parte relativa a uploads/
        if (/^https?:\/\//i.test(prevPath)) {
          const idx = prevPath.indexOf("uploads/");
          if (idx !== -1) prevPath = prevPath.substring(idx);
          else prevPath = null;
        }

        if (prevPath && prevPath.includes("uploads")) {
          // Resolver la ruta desde el directorio del proyecto
          const fullPath = path.resolve(__dirname, '..', prevPath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      } catch (e) {
        console.warn("No se pudo eliminar la foto previa:", e.message || e);
      }
    }

    return res.status(201).json({
      message: "Imagen subida correctamente",
      url: fileUrl,
      path: filePath,
    });
  } catch (err) {
    console.error("Error en uploadImage:", err);

    // Si hay archivo subido pero ocurre error, eliminarlo
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("No se pudo limpiar archivo temporal:", e.message || e);
      }
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};