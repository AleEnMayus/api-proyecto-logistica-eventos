function notificationSocket(io) {
  io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    socket.on("joinRoom", (userIdOrRole) => {
      if (userIdOrRole === "admins") {
        socket.join("admins");
        console.log("Admin unido a sala admins");
      } else {
      
        socket.join(`user_${userIdOrRole}`);
        console.log(`Usuario ${userIdOrRole} unido a sala user_${userIdOrRole}`);
      }
    });

    socket.on("notifyAdmin", (data) => {
      io.to("admins").emit("notification:admin", data);
    });

    socket.on("notifyClient", (userId, data) => {
      io.to(`user_${userId}`).emit("notification:client", data);
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
}

module.exports = { notificationSocket };
