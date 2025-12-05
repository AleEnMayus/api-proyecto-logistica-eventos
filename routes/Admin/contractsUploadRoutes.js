const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ContractsController = require("../../controllers/ContractsController");

const router = express.Router();

// Configuración de almacenamiento para PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/contracts");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Solo se permiten archivos PDF"));
  }, 
});


// =======================
// OBTENER CONTRATOS POR CLIENTE
// =======================
router.get("/by-client/:clientId", ContractsController.getByClient);

// =======================
// SUBIR O REEMPLAZAR CONTRATO
// =======================
router.post("/upload", upload.single("pdf"), ContractsController.upload);

// =======================
// LISTAR TODOS LOS CONTRATOS
// =======================
router.get("/list", ContractsController.list);

// =======================
// OBTENER CONTRATO POR EVENTO
// =======================
router.get("/by-event/:eventId", ContractsController.byEvent);

// =======================
// DESCARGAR CONTRATO
// =======================
router.get("/download/:eventId", ContractsController.download);

// =======================
// ELIMINAR CONTRATO
// =======================
router.delete("/delete/:eventId", ContractsController.delete);

// =======================
// REENVIAR CONTRATO POR CORREO
// =======================
router.post("/send-email/:eventId", ContractsController.sendEmail);

module.exports = router;