const db = require("../db");

// Obtener listado resumido de eventos
async function getEvents() {
  const [rows] = await db.query(`
    SELECT 
      e.EventId,
      e.EventDateTime,
      e.EventName,
      e.EventStatus,
      u.Names AS ClientName
    FROM Events e
    LEFT JOIN User u ON e.ClientId = u.UserId
    ORDER BY e.CreationDate DESC
  `);
  return rows;
}

// Obtener evento por ID con detalles completos
async function getEventById(id) {
  const [rows] = await db.query(`
    SELECT 
      e.EventId,
      e.EventName,
      e.ClientId,
      u.Names AS ClientName,
      e.EventStatus,
      e.Capacity,
      e.EventPrice,
      e.AdvancePaymentMethod,
      e.CreationDate,
      e.EventDateTime,
      e.Address,
      e.EventDescription,
      e.ContractRoute,
      e.ContractNumber
    FROM Events e
    LEFT JOIN User u ON e.ClientId = u.UserId
    WHERE e.EventId = ?
  `, [id]);

  return rows.length > 0 ? rows[0] : null;
}

// Crear evento
async function addEvent(event) {
  const CreationDate = new Date();

  const [result] = await db.query(
    `INSERT INTO Events 
      (EventName, ClientId, EventStatus, Capacity, EventPrice, 
       AdvancePaymentMethod, CreationDate, EventDateTime, 
       Address, EventDescription, ContractRoute, ContractNumber) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.EventName,
      event.ClientId,
      event.EventStatus || "In_planning",
      event.Capacity,
      event.EventPrice,
      event.AdvancePaymentMethod,
      CreationDate,
      event.EventDateTime,
      event.Address,
      event.EventDescription,
      event.ContractRoute || null,
      event.ContractNumber || null
    ]
  );
  return result.insertId;
}

// Actualizar estado
async function updateEventStatus(id, status) {
  const [result] = await db.query(
    "UPDATE Events SET EventStatus = ? WHERE EventId = ?",
    [status, id]
  );
  return result.affectedRows > 0;
}

// Actualización evento completo
async function updateEvent(id, event) {
  const [result] = await db.query(
    `UPDATE Events 
     SET EventName=?, EventStatus=?, Capacity=?, EventPrice=?, 
         AdvancePaymentMethod=?, EventDateTime=?, Address=?, 
         EventDescription=?, ContractRoute=?, ContractNumber=? 
     WHERE EventId=?`,
    [
      event.EventName,
      event.EventStatus,
      event.Capacity,
      event.EventPrice,
      event.AdvancePaymentMethod,
      event.EventDateTime,
      event.Address,
      event.EventDescription,
      event.ContractRoute,
      event.ContractNumber,
      id
    ]
  );
  return result.affectedRows > 0;
}

// Eliminar evento
async function deleteEvent(id) {
  const [result] = await db.query("DELETE FROM Events WHERE EventId = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent
};