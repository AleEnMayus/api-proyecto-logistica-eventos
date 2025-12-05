const express = require("express");
const router = express.Router();
const changePassword = require("../controllers/PasswordChange");
const PasswordController = require("../controllers/PasswordController");

// Ruta para cambiar la contraseña desde el perfil
router.put("/:userId/change-password", changePassword.changePassword);

// Rutas para restablecer la contraseña (olvidé mi contraseña)
router.post("/send-code", PasswordController.sendResetCode);
router.post("/verify-code", PasswordController.verifyCode);
router.post("/reset-password", PasswordController.resetPassword);

module.exports = router;