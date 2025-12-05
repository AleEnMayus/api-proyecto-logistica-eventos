// testNotifications.js
const { io } = require("socket.io-client");

// Cambia estos valores según el usuario/admin que quieras simular
const user = {
  UserId: 1,      // ID del usuario
  role: "user"    // "user" o "admin"
};

const socket = io("http://localhost:4000", {
  auth: {
    userId: user.UserId,
    role: user.role
  },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log(`[${user.role}] Conectado con ID:`, socket.id);

  // Unirse a la sala privada del usuario
  if (user.role === "user") {
    socket.emit("joinRoom", user.UserId);
    console.log(`[${user.role}] Unido a sala: user_${user.UserId}`);
  }

  if (user.role === "admin") {
    socket.join("admins"); // opcional si tu backend maneja sala admins
    console.log(`[${user.role}] Unido a sala de admins`);
  }

  // Simular envío de notificación
  setTimeout(() => {
    if (user.role === "admin") {
      console.log(`[${user.role}] Enviando notificación a clientes`);
      socket.emit("notifyClient", 1); // Notificar al usuario 1
    } else {
      console.log(`[${user.role}] Enviando notificación a admins`);
      socket.emit("notifyAdmin"); // Notificar a todos los admins
    }
  }, 3000);
});

// Escuchar notificaciones
socket.on("notification:admin", (data) => {
  console.log("[ADMIN RECEIVED]", data || "Nueva notificación admin");
});

socket.on("notification:client", (data) => {
  console.log("[CLIENT RECEIVED]", data || "Nueva notificación cliente");
});

// Manejar desconexión
socket.on("disconnect", () => {
  console.log(`[${user.role}] Desconectado`);
});