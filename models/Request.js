const db = require("../db");

const Request = {
  // Obtener todas las solicitudes
  getAll: async () => {
    const [rows] = await db.query(`SELECT * FROM Requests`);
    return rows;
  },

  // Obtener una solicitud por ID
  getById: async (id) => {
    const [rows] = await db.query(`SELECT * FROM Requests WHERE RequestId = ?`, [id]);
    return rows[0];
  },

  // Crear una nueva solicitud
  create: async ({ RequestDate, RequestDescription, RequestType, UserId, EventId }) => {
    const [result] = await db.query(
      `INSERT INTO Requests (RequestDate, RequestDescription, RequestType, RequestStatus, UserId, EventId) 
      VALUES (?, ?, ?, 'pending', ?, ?)`,
      [RequestDate, RequestDescription, RequestType, UserId, EventId || null] // si no envían EventId, será NULL
    );
    return result.insertId;
  },

  // Actualizar estado de la solicitud
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      `UPDATE Requests SET RequestStatus = ? WHERE RequestId = ?`,
      [status, id]
    );
    return result.affectedRows;
  },

  // Eliminar una solicitud
  delete: async (id) => {
    const [result] = await db.query(`DELETE FROM Requests WHERE RequestId = ?`, [id]);
    return result.affectedRows;
  },
};

module.exports = Request;