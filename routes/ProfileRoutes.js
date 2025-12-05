const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const profileController = require("../controllers/profileController");

const router = express.Router();

// ===== CONFIGURACIÓN DE MULTER =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/profiles/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ===== RUTAS =====
router.get("/:UserId", profileController.getProfileImage);
router.post("/:UserId", upload.single("photo"), profileController.uploadImage);

module.exports = router;