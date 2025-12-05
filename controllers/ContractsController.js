const path = require("path");
const fs = require("fs");
const db = require("../db");
const emailService = require("../services/emailService");

// Helper: remove leading slashes/backslashes to avoid absolute paths when joining
function sanitizeRoute(route) {
  if (!route) return route;
  let r = String(route).replace(/\\/g, "/").trim();
  r = r.replace(/^\/+/, "");
  r = r.replace(/[\.\/]+$/g, "");
  return r;
}

function findExistingFile(candidatePath) {
  if (fs.existsSync(candidatePath)) return candidatePath;
  const trimmedDot = candidatePath.replace(/[\.]+$/g, "");
  if (trimmedDot !== candidatePath && fs.existsSync(trimmedDot)) return trimmedDot;
  const withPdf = candidatePath + ".pdf";
  if (fs.existsSync(withPdf)) return withPdf;
  const trimmedWithPdf = trimmedDot + ".pdf";
  if (fs.existsSync(trimmedWithPdf)) return trimmedWithPdf;
  if (candidatePath.toLowerCase().endsWith('.pdf.pdf')) {
    const trimmed = candidatePath.slice(0, -4);
    if (fs.existsSync(trimmed)) return trimmed;
  }
  return null;
}

exports.getByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        EventId, 
        EventName, 
        ContractRoute, 
        ContractNumber,
        EventDateTime,
        EventStatus
      FROM Events 
      WHERE ClientId = ?
      ORDER BY EventDateTime DESC`,
      [clientId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener contratos del cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.upload = async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ error: "Falta el ID del evento" });
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });

    // Store path WITHOUT leading slash so path.join works reliably later
    const contractPath = `uploads/contracts/${req.file.filename}`;
    const contractNumber = Math.floor(100000 + Math.random() * 900000);

    // Verificar si ya existe un contrato
    const [[existing]] = await db.query(
      "SELECT ContractRoute FROM Events WHERE EventId = ?",
      [eventId]
    );

    // Si existe contrato anterior, eliminar el archivo físico (async)
    if (existing && existing.ContractRoute) {
      const oldFilePathCandidate = path.join(__dirname, "../../", sanitizeRoute(existing.ContractRoute));
      const actualOldFile = findExistingFile(oldFilePathCandidate);
      if (actualOldFile) {
        try {
          await fs.promises.unlink(actualOldFile);
          console.log("Contrato anterior eliminado:", actualOldFile);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.warn('No se pudo eliminar contrato anterior:', err.message || err);
          }
        }
      } else {
        console.log("Contrato anterior no encontrado en disco (no se eliminará):", oldFilePathCandidate);
      }
    }

    // Actualizar o crear contrato
    await db.query(
      `UPDATE Events SET ContractRoute = ?, ContractNumber = ? WHERE EventId = ?`,
      [contractPath, contractNumber, eventId]
    );

    // Obtener correo del cliente
    const [[eventData]] = await db.query(
      `SELECT e.EventName, u.Email, u.Names 
       FROM Events e
       INNER JOIN User u ON e.ClientId = u.UserId
       WHERE e.EventId = ?`,
      [eventId]
    );

    if (!eventData) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Enviar correo usando el servicio de email
    const accion = existing && existing.ContractRoute ? "actualizado" : "asignado";
    const contractFullPath = path.join(__dirname, "../", contractPath);
    
    try {
      await emailService.sendContractEmail(eventData, contractFullPath, accion, contractNumber);
    } catch (mailError) {
      console.warn("Error al enviar correo de contrato:", mailError.message || mailError);
    }

    const mensaje = existing && existing.ContractRoute 
      ? "Contrato reemplazado y enviado correctamente"
      : "Contrato subido y enviado correctamente";

    res.json({
      message: mensaje,
      data: { 
        contractNumber, 
        emailSentTo: eventData.Email,
        replaced: !!(existing && existing.ContractRoute)
      },
    });
  } catch (error) {
    console.error("Error al subir contrato:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.list = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        e.EventId, 
        e.EventName, 
        e.ContractRoute, 
        e.ContractNumber,
        e.EventDateTime,
        e.EventStatus,
        u.Names AS ClientName,
        u.Email AS ClientEmail
      FROM Events e
      INNER JOIN User u ON e.ClientId = u.UserId
      WHERE e.ContractRoute IS NOT NULL
      ORDER BY e.EventDateTime ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al listar contratos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.byEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await db.query(
      "SELECT ContractRoute, ContractNumber FROM Events WHERE EventId = ?",
      [eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontró el evento" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener contrato:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.download = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [[event]] = await db.query(
      "SELECT ContractRoute, EventName FROM Events WHERE EventId = ?",
      [eventId]
    );

    if (!event || !event.ContractRoute) {
      return res.status(404).json({ message: "No hay contrato disponible" });
    }

    const filePathCandidate = path.join(__dirname, "../", sanitizeRoute(event.ContractRoute));
    const actualFilePath = findExistingFile(filePathCandidate);
    if (!actualFilePath) {
      console.warn('Archivo no encontrado en el servidor (todas las variantes):', filePathCandidate);
      return res.status(404).json({ message: "Archivo no encontrado en el servidor" });
    }
    // If the stored DB route differs from the actual file (e.g. missing .pdf or leading slash), update the DB
    try {
      const rel = path.relative(path.join(__dirname, "../"), actualFilePath).replace(/\\\\/g, "/");
      const stored = sanitizeRoute(event.ContractRoute);
      if (rel !== stored) {
        await db.query("UPDATE Events SET ContractRoute = ? WHERE EventId = ?", [rel, eventId]);
        console.log('ContractRoute actualizado en DB para eventId', eventId, '->', rel);
      }
    } catch (dbErr) {
      console.warn('No se pudo actualizar ContractRoute en DB:', dbErr.message);
    }

    res.download(actualFilePath, `Contrato_${event.EventName}.pdf`);
  } catch (error) {
    console.error("Error al descargar contrato:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.delete = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [[event]] = await db.query(
      "SELECT ContractRoute FROM Events WHERE EventId = ?",
      [eventId]
    );

    if (!event || !event.ContractRoute) {
      return res.status(404).json({ message: "No hay contrato que eliminar" });
    }

    // Eliminar archivo físico si existe (async)
    const filePathCandidate = path.join(__dirname, "../", sanitizeRoute(event.ContractRoute));
    const actualFilePath = findExistingFile(filePathCandidate);
    
    if (actualFilePath) {
      try {
        await fs.promises.unlink(actualFilePath);
        console.log('Archivo de contrato eliminado:', actualFilePath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.warn('Error al eliminar archivo de contrato:', err.message || err);
        }
      }
    } else {
      console.warn('Archivo de contrato a eliminar no encontrado (todas las variantes):', filePathCandidate);
    }

    // Limpiar campos en la base de datos
    await db.query(
      "UPDATE Events SET ContractRoute = NULL, ContractNumber = NULL WHERE EventId = ?",
      [eventId]
    );

    res.json({ message: "Contrato eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar contrato:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [[eventData]] = await db.query(
      `SELECT 
        e.EventName, 
        e.ContractRoute, 
        e.ContractNumber,
        u.Email, 
        u.Names
      FROM Events e
      INNER JOIN User u ON e.ClientId = u.UserId
      WHERE e.EventId = ?`,
      [eventId]
    );

    if (!eventData) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    if (!eventData.ContractRoute) {
      return res.status(404).json({ error: "No hay contrato disponible para este evento" });
    }

    // Log de debug: ver qué ruta se intenta buscar
    console.log("ContractRoute en DB:", eventData.ContractRoute);
    
    const filePathCandidate = path.join(__dirname, "../", sanitizeRoute(eventData.ContractRoute));
    console.log("Ruta candidata construida:", filePathCandidate);
    
    const actualFilePath = findExistingFile(filePathCandidate);
    console.log("Archivo encontrado:", actualFilePath);
    
    if (!actualFilePath) {
      console.warn('Archivo del contrato no encontrado en el servidor:', filePathCandidate);
      return res.status(404).json({ 
        error: "Archivo del contrato no encontrado en el servidor",
        debug: {
          stored: eventData.ContractRoute,
          attempted: filePathCandidate,
          cwd: process.cwd()
        }
      });
    }
    
    // Verificar que el archivo existe realmente
    if (!fs.existsSync(actualFilePath)) {
      console.warn('Archivo no es accesible:', actualFilePath);
      return res.status(404).json({ error: "Archivo no es accesible" });
    }

    // Enviar correo usando el servicio de email
    try {
      await emailService.sendContractEmail(eventData, actualFilePath, "enviado", eventData.ContractNumber);
    } catch (mailError) {
      console.error("Error al enviar correo de contrato:", mailError.message || mailError);
      return res.status(500).json({ error: "Error al enviar el correo: " + (mailError.message || "error desconocido") });
    }

    res.json({
      message: "Correo enviado exitosamente",
      emailSentTo: eventData.Email
    });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ error: "Error al enviar el correo: " + error.message });
  }
};

