const express = require("express");
const router = express.Router();
const calendarController = require("../../controllers/calendarController"); // Ajusta la ruta según tu estructura

router.get("/user/:userId", calendarController.getUserCalendar);
router.get("/admin", calendarController.getAdminCalendar);
router.get("/event/:eventId", calendarController.getEventDetail);
router.get("/appointment/:requestId", calendarController.getAppointmentDetail);

module.exports = router;
