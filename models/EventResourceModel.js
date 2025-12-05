const db = require("../db");

const EventResourcesModel = {
  getResourcesByEventId: async (eventId) => {
    const [rows] = await db.query(
      `SELECT 
        er.EventResourceId,
        r.ResourceName,
        er.AssignedQuantity,
        er.AssignmentStatus,
        er.Prices
      FROM EventResources er
      JOIN Resources r ON er.ResourceId = r.ResourceId
      WHERE er.EventId = ?`,
      [eventId]
    );
    return rows;
  },
};

module.exports = EventResourcesModel;
