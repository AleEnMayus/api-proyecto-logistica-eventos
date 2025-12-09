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
  create: async ({ RequestDate, ManagementDate, RequestDescription, RequestType, UserId, EventId }) => {
    const [result] = await db.query(
      `INSERT INTO Requests (RequestDate, ManagementDate, RequestDescription, RequestType, RequestStatus, UserId, EventId) 
      VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [
        RequestDate || null, 
        ManagementDate || null, 
        RequestDescription, 
        RequestType, 
        UserId, 
        EventId || null
      ]
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

  // Actualizar fecha de gestión (ManagementDate)
  updateManagementDate: async (id, managementDate) => {
    const [result] = await db.query(
      `UPDATE Requests SET ManagementDate = ? WHERE RequestId = ?`,
      [managementDate, id]
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
