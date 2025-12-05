const express = require("express");
const router = express.Router();
const promotionsController = require("../../controllers/promotionController");

// Obtener todas las promociones
router.get("/", promotionsController.getAll);

// Obtener promoción por ID
router.get("/:id", promotionsController.getById);

// Crear promoción
router.post("/", promotionsController.create);

// Actualizar promoción
router.put("/", promotionsController.update);

// Eliminar promoción
router.delete("/:id", promotionsController.delete);

module.exports = router;
