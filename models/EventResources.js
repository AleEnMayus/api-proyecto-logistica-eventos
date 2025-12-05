const db = require("../db");

const EventResources = {
  assignResources: async (eventId, resources) => {
    try {
      // Validación que el evento exista
      const [eventRows] = await db.query("SELECT * FROM Events WHERE EventId = ?", [eventId]);
      if (eventRows.length === 0) {
        throw new Error("Evento no encontrado");
      }

      const results = [];
      for (const r of resources) {
        const sql = `
          INSERT INTO EventResources (AssignedQuantity, AssignmentStatus, EventId, ResourceId, Prices)
          VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
          r.quantity,
          r.status,
          eventId,
          r.resourceId,
          r.price
        ];
        const [result] = await db.query(sql, values);
        results.push({ id: result.insertId, ...r });
      }
      return results;
    } catch (error) {
      console.error("Error en assignResources:", error);
      throw error;
    }
  },

  getResourcesByEvent: async (eventId) => {
    const [rows] = await db.query(`
    SELECT 
      er.EventResourceId,
      er.AssignedQuantity,
      er.AssignmentStatus,
      er.EventId,
      er.Prices,
      er.ResourceId,
      r.ResourceName,
      r.Status,
      r.StatusDescription
    FROM EventResources er
    INNER JOIN Resources r ON er.ResourceId = r.ResourceId
    WHERE (er.EventId = ?) && (er.AssignmentStatus = 'assigned')
  `, [eventId]);
    return rows;
  }
};

// Reemplaza todos los recursos asignados a un evento (borrar y volver a insertar)
EventResources.replaceResourcesForEvent = async (eventId, resources) => {
  try {
    // Borrar asignaciones existentes
    await db.query('DELETE FROM EventResources WHERE EventId = ?', [eventId]);

    // Insertar nuevas asignaciones
    const results = [];
    for (const r of resources) {
      const sql = `
        INSERT INTO EventResources (AssignedQuantity, AssignmentStatus, EventId, ResourceId, Prices)
        VALUES (?, ?, ?, ?, ?)
      `;
      // Aceptar varias formas de los objetos (frontend puede enviar ResourceId/AssignedQuantity/AssignmentStatus/Prices)
      const assignedQuantity = r.quantity ?? r.AssignedQuantity ?? r.Assigned_Quantity ?? 1;
      const assignmentStatus = r.status ?? r.AssignmentStatus ?? r.Assignment_Status ?? 'assigned';
      const resourceId = r.resourceId ?? r.ResourceId;
      const price = r.price ?? r.Prices ?? 0;

      const values = [
        assignedQuantity,
        assignmentStatus,
        eventId,
        resourceId,
        price,
      ];
      const [result] = await db.query(sql, values);
      results.push({ id: result.insertId, ...r });
    }
    return results;
  } catch (error) {
    console.error('Error en replaceResourcesForEvent:', error);
    throw error;
  }
};

module.exports = EventResources;
