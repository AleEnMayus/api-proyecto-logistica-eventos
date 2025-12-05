const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Preferir token en cookie HttpOnly
  const cookieToken = req.cookies && req.cookies.authToken;
  let token = null;

  if (cookieToken) token = cookieToken;
  else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: "No autenticado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = authMiddleware;
