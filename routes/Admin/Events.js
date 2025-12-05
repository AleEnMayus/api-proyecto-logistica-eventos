const express = require("express");
const router = express.Router();
const eventController = require("../../controllers/Events");

router.get("", eventController.getEvents);
router.post("", eventController.createEvent);
router.get("/:id", eventController.getEventById);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);
router.patch("/:id/status", eventController.updateEventStatus);
// endpoint para obtener eventos por ID de usuario
router.get("/user/:userId", eventController.getEventsByUserId);


module.exports = router;