const express = require("express");
const router = express.Router();
const profileController = require("../controllers/Profile");

// GET - Obtener perfil de un usuario
router.get("/:userId", profileController.getProfile);

// PUT - Editar perfil de un usuario
router.put("/:userId", profileController.updateProfile);

module.exports = router;