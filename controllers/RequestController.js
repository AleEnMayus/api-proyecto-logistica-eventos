const Request = require("../models/Request");
const Event = require("../models/Events");
const { getIo } = require("../sockets/socket");

const io = getIo();

function formatDateForMySQL(dateString) {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

const requestController = {
  getAll: async (req, res) => {
    try {
      const requests = await Request.getAll();
      res.json(requests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener solicitudes" });
    }
  },

  getById: async (req, res) => {
    try {
      const request = await Request.getById(req.params.id);
      if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
      res.json(request);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener la solicitud" });
    }
  },

  create: async (req, res) => {
  try {
    let { RequestDate, RequestDescription, RequestType, UserId, EventId } = req.body;

    const validTypes = ["schedule_appointment", "cancel_event", "document_change"];
    if (!validTypes.includes(RequestType)) {
      return res.status(400).json({ error: "Tipo de solicitud inválido" });
    }

    if (RequestType === "cancel_event" && !EventId) {
      return res.status(400).json({ error: "EventId es obligatorio para cancelar un evento" });
    }

    if (RequestDate) {
      RequestDate = formatDateForMySQL(RequestDate);
    }

    // Intentar crear la solicitud
    const id = await Request.create({
      RequestDate,
      RequestDescription,
      RequestType,
      UserId,
      EventId: EventId || null,
    });

    // Notificación en tiempo real a todos los administradores
    io.to("admins").emit("notification:admin", {
      message: RequestDescription,
      requestType: RequestType,
      userId: UserId,
      requestId: id,
    });

    res.status(201).json({ message: "Solicitud creada", RequestId: id });

  } catch (err) {
    console.error("Error completo al crear solicitud:", {
      code: err.code,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
      message: err.message,
      errno: err.errno
    });

    // Capturar errores específicos del trigger de validación
    if (err.code === 'ER_SIGNAL_EXCEPTION' || err.sqlState === '45000') {
      // El trigger lanzó un error personalizado
      const errorMessage = err.sqlMessage || err.message;
      
      console.log("Error del trigger detectado:", errorMessage);
      
      return res.status(400).json({ 
        error: errorMessage,
        type: 'validation_error'
      });
    }

    // Otros errores de MySQL
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ 
        error: "El evento o usuario especificado no existe" 
      });
    }

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: "Ya existe una solicitud similar" 
      });
    }

    // Error genérico
    res.status(500).json({ 
      error: "Error al crear la solicitud",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
},

  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const validStatus = ["pending", "approved", "rejected"];
      if (!validStatus.includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      const request = await Request.getById(req.params.id);
      if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });

      await Request.updateStatus(req.params.id, status);

      if (request.RequestType === "cancel_event" && status === "approved") {
        await Event.updateEvent(request.EventId, { EventStatus: "Canceled" });
      }

      // Notificaciónes al cliente con más datos
      io.to(`user_${request.UserId}`).emit("notification:client", {
        message: `Tu solicitud de tipo "${request.RequestType}" fue ${status}`,
        requestId: req.params.id,
        status,
        type: request.RequestType,
      });

      res.json({ message: "Estado actualizado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar estado" });
    }
  },

  delete: async (req, res) => {
    try {
      const affected = await Request.delete(req.params.id);
      if (!affected) return res.status(404).json({ error: "Solicitud no encontrada" });
      res.json({ message: "Solicitud eliminada" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar solicitud" });
    }
  },
};

module.exports = requestController;
