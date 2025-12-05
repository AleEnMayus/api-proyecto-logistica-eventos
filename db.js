const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ProyectoLogisticaEventos"
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("/ Conectado a MySQL");
    connection.release(); // Liberar la conexión al pool
  } catch (err) {
    console.error("X Error conectando a MySQL:", err);
  }
})();

module.exports = pool;
