const User = require("../models/auth");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { fullName, birthDate, identificationType, documentNumber, email, password } = req.body;

  if (!fullName || !birthDate || !identificationType || !documentNumber || !email || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const existingUser = await User.findByEmailOrDocument(email, documentNumber);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "El correo o número de documento ya está registrado" });
    }

    await User.create({ fullName, identificationType, documentNumber, birthDate, email, password });
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(" Error en el registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos", error: "MISSING_CREDENTIALS" });
  }

  try {
    // Buscar usuario por email
    let user = null;
    try {
      user = await User.findByEmail(email);
    } catch (dbError) {
      console.error("Error en base de datos (findByEmail):", dbError);
      return res.status(500).json({ message: "Error al conectar con la base de datos", error: "DB_ERROR" });
    }

    if (!user) {
      // Usuario no existe
      return res.status(401).json({ message: "El correo no está registrado o las credenciales son incorrectas", error: "INVALID_CREDENTIALS" });
    }

    // Validar si la cuenta está inactiva
    if (user.Status === "inactive") {
      console.warn(`Intento de login con cuenta inactiva: ${email}`);
      return res.status(403).json({ message: "La cuenta está inactiva. Contacte al administrador.", error: "ACCOUNT_INACTIVE" });
    }

    // Comparar contraseña
    let passwordMatch = false;
    try {
      passwordMatch = await User.comparePassword(password, user.Password);
    } catch (bcryptError) {
      console.error("Error al comparar contraseña:", bcryptError);
      return res.status(500).json({ message: "Error al validar credenciales", error: "PASSWORD_CHECK_ERROR" });
    }

    if (!passwordMatch) {
      // Contraseña incorrecta
      return res.status(401).json({ message: "El correo no está registrado o las credenciales son incorrectas", error: "INVALID_CREDENTIALS" });
    }

    // Crear token al validar todo y enviarlo en cookie HttpOnly
    let token = null;
    try {
      token = jwt.sign(
        { id: user.UserId, email: user.Email, role: user.Role, fullName: user.Names },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
    } catch (jwtError) {
      console.error("Error al crear JWT:", jwtError);
      return res.status(500).json({ message: "Error al generar token de sesión", error: "JWT_ERROR" });
    }

    // En entornos de desarrollo no forzamos secure:true para permitir pruebas en http
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProd, // true en producción (https)
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 horas
    });

    // Log de login exitoso
    console.log(`Login exitoso para usuario: ${email}`);

    res.status(200).json({
      user: {
        id: user.UserId,
        fullName: user.Names,
        identificationType: user.DocumentType,
        documentNumber: user.DocumentNumber,
        email: user.Email,
        birthDate: user.BirthDate,
        role: user.Role,
        photo: user.Photo,
      },
    });

  } catch (error) {
    console.error("Error inesperado en login:", error.message || error);
    res.status(500).json({ message: "Error inesperado en el servidor. Intenta nuevamente.", error: "UNEXPECTED_ERROR" });
  }
};


const logout = (req, res) => {
  try {
    res.clearCookie('authToken');
    return res.json({ message: 'Sesión cerrada' });
  } catch (e) {
    console.error('Error en logout:', e);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { register, login, logout };