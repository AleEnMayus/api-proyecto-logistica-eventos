const PasswordReset = require("../models/PasswordReset");
const { sendPasswordResetEmail } = require("../services/emailService");

// Enviar código de recuperación
const sendResetCode = async (req, res) => {
  const { email } = req.body;

  // Validación
  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: "El email es requerido" 
    });
  }

  try {
    // Verificar si el usuario existe
    const exists = await PasswordReset.userExists(email);
    if (!exists) {
      return res.status(404).json({ 
        success: false,
        message: "No existe una cuenta con este correo" 
      });
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código en BD (controla límites de envío)
    const result = await PasswordReset.createResetCode(email, code);
    
    if (!result.success) {
      return res.status(429).json({ 
        success: false,
        message: result.message 
      });
    }

    // Enviar correo
    await sendPasswordResetEmail(email, code);

    res.json({ 
      success: true,
      message: "Código enviado al correo. Válido por 15 minutos." 
    });

  } catch (error) {
    console.error("Error enviando código:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar la solicitud" 
    });
  }
};

// Verificar código (sin cambiar contraseña)
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  // Validación
  if (!email || !code) {
    return res.status(400).json({ 
      success: false,
      message: "Email y código son requeridos" 
    });
  }

  try {
    const result = await PasswordReset.verifyCodeProcedure(email, code);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false,
        message: result.message 
      });
    }

    res.json({ 
      success: true,
      message: "Código válido" 
    });

  } catch (error) {
    console.error("Error verificando código:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al verificar el código" 
    });
  }
};

// Resetear contraseña
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  // Validación
  if (!email || !code || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: "Todos los campos son requeridos" 
    });
  }

  // Validar longitud de contraseña
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres" 
    });
  }

  try {
    // Verificar código
    const verifyResult = await PasswordReset.verifyCodeProcedure(email, code);
    
    if (!verifyResult.success) {
      return res.status(400).json({ 
        success: false,
        message: verifyResult.message 
      });
    }

    // Actualizar contraseña
    await PasswordReset.updatePassword(email, newPassword);

    res.json({ 
      success: true,
      message: "Contraseña actualizada exitosamente" 
    });

  } catch (error) {
    console.error("Error reseteando contraseña:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar la contraseña" 
    });
  }
};

module.exports = { 
  sendResetCode, 
  verifyCode, 
  resetPassword 
};