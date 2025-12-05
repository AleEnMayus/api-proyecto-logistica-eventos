const express = require("express");
const router = express.Router();
const requestController = require("../../controllers/RequestController");

// Obtener todas las solicitudes
router.get("/", requestController.getAll);

// Obtener una solicitud por ID
router.get("/:id", requestController.getById);

// Crear nueva solicitud
router.post("/", requestController.create);

// Actualizar estado de solicitud
router.put("/:id/status", requestController.updateStatus);

// Eliminar solicitud
router.delete("/:id", requestController.delete);

module.exports = router;