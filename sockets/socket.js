let io; // variable global temporal

module.exports = {
  init: httpServer => {
    io = require("socket.io")(httpServer, {
      cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io no está inicializado todavía");
    }
    return io;
  }
};