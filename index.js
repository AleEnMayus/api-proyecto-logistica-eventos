const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cookieParser = require('cookie-parser');

const db = require("./db");
const { startEventCompletionJob } = require("./jobs/eventCompletionJob");

const app = express();
const PORT = process.env.PORT || 4000;

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.IO
const { init } = require("./sockets/socket");
const { notificationSocket } = require("./sockets/notificationSocket");

const io = init(server);
notificationSocket(io);

// Middlewares
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Servir carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta principal
app.get("/", (req, res) => {
  res.send("<center><h1>Backend funcionando con Socket.IO</h1></center>");
});

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/password", require("./routes/PasswordChange"));
app.use("/api/questions", require("./routes/Admin/questions"));
app.use("/api/survey", require("./routes/user/Survey"));
app.use("/api/resources", require("./routes/Admin/Resources"));
app.use("/api/events", require("./routes/Admin/Events"));
app.use("/api/accounts", require("./routes/Admin/accounts"));
app.use("/api/profile", require("./routes/Profile"));
app.use("/api/requests", require("./routes/user/Request"));
app.use("/api/promotions", require("./routes/Admin/promotions"));
app.use("/api/gallery", require("./routes/Admin/galleryRoutes"));
app.use("/api/gallery", require("./routes/commentsRoutes"));
app.use("/api/contracts", require("./routes/Admin/contractsUploadRoutes"));
app.use("/api/calendar", require("./routes/Admin/calendarRoutes"));
app.use("/api/pfp", require("./routes/ProfileRoutes"));


// Jobs automáticos
startEventCompletionJob();

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`-/ Backend corriendo en http://localhost:${PORT}`) ;
  console.log("-/ Socket.IO activo para notificaciones en tiempo real");
});
