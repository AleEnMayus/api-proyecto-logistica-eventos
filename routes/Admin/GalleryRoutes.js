const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const galleryController = require("../../controllers/GalleryController");

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/gallery/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Rutas de imágenes
router.get("/paginated", galleryController.getPaginatedImages);
router.post("/", upload.single("file"), galleryController.uploadImage);
router.get("/", galleryController.getAllImages);
router.get("/:id", galleryController.getImageById);
router.delete("/:id", galleryController.deleteImage);
router.delete("/", galleryController.deleteAllImages);

module.exports = router;
