const db = require("../db");

// Obtener calendario de un usuario específico
exports.getUserCalendar = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, type } = req.query;

    let query = `
      SELECT * 
      FROM UserCalendarView 
      WHERE CONVERT(user_id USING utf8mb4) COLLATE utf8mb4_unicode_ci = ? 
    `;
    const params = [userId];

    if (startDate && endDate) {
      query += ' AND start_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (type && (type === 'event' || type === 'appointment')) {
      query += ' AND CONVERT(type USING utf8mb4) COLLATE utf8mb4_unicode_ci = ?';
      params.push(type);
    }

    query += ' ORDER BY start_date ASC';

    const [rows] = await db.query(query, params);

    const events = rows.map(row => ({
      id: `${row.type}-${row.id}`,
      title: row.title,
      start: row.start_date,
      type: row.type,
      status: row.status,
      location: row.location,
      description: row.description,
      capacity: row.Capacity,
      userName: row.userName,
      requestId: row.request_id,
      requestType: row.request_type
    }));

    res.json(events);
  } catch (err) {
    console.error("Error al obtener calendario de usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener calendario completo (Admin)
exports.getAdminCalendar = async (req, res) => {
  try {
    const { startDate, endDate, type, status } = req.query;

    let query = `SELECT * FROM AdminCalendarView WHERE 1=1`;
    const params = [];

    if (startDate && endDate) {
      query += ' AND start_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (type && (type === 'event' || type === 'appointment')) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_date ASC';

    const [rows] = await db.query(query, params);

    const events = rows.map(row => ({
      id: `${row.type}-${row.id}`,
      title: row.title,
      start: row.start_date,
      type: row.type,
      status: row.status,
      location: row.location,
      description: row.description,
      capacity: row.Capacity,
      userId: row.user_id,
      userName: row.userName, // ya viene seguro desde la vista
      userEmail: row.user_email,
      paymentMethod: row.payment_method,
      contractNumber: row.ContractNumber,
      requestId: row.request_id,
      requestType: row.request_type,
      requestDate: row.request_date
    }));

    res.json(events);
  } catch (err) {
    console.error("Error al obtener calendario admin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getEventDetail = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await db.query(
      `SELECT e.*, u.Names, u.LastNames, u.Email, u.PhoneNumber
       FROM Events e
       INNER JOIN User u ON e.ClientId = u.UserId
       WHERE e.EventId = ?`,
      [eventId]
    );

    if (!rows.length) return res.status(404).json({ error: "Evento no encontrado" });

    const event = rows[0];
    res.json(event);
  } catch (err) {
    console.error("Error al obtener detalle del evento:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getAppointmentDetail = async (req, res) => {
  try {
    const { requestId } = req.params;
    const [rows] = await db.query(
      `SELECT r.*, u.Names, u.LastNames, u.Email, u.PhoneNumber
       FROM Requests r
       INNER JOIN User u ON r.UserId = u.UserId
       WHERE r.RequestId = ?`,
      [requestId]
    );

    if (!rows.length) return res.status(404).json({ error: "Cita no encontrada" });

    const appointment = rows[0];
    res.json(appointment);
  } catch (err) {
    console.error("Error al obtener detalle de la cita:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
