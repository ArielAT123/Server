import { Event } from "../models/event.js";
import { User } from "../models/user.js";
import { getFilePath } from "../utils/index.js";

export const EventController = {
  // Crear evento (con imagen opcional)
  create: async (req, res) => {
    try {
      const { user_id } = req.user;
      const { title, description, date, category, link, isFree, tags } = req.body;

      if (!title || !description || !date || !category) {
        return res.status(400).send({ msg: "Faltan campos obligatorios" });
      }

      const eventData = {
        title,
        description,
        date: new Date(date),
        category,
        link: link || null,
        isFree: isFree === "true",
        tags: tags ? tags.split(",").map(tag => tag.trim().toLowerCase()) : [],
        creator: user_id
      };

      if (req.files?.image) {
        eventData.image = getFilePath(req.files.image);
      }

      const event = new Event(eventData);
      await event.save();

      // Notificar a seguidores (opcional)
      // ... lógica de notificaciones aquí

      res.status(201).send(event);
    } catch (error) {
      console.error("Error en create event:", error);
      res.status(500).send({ msg: "Error al crear evento", error: error.message });
    }
  },

  // Obtener todos los eventos (con filtros)
  getAll: async (req, res) => {
    try {
      const { category, upcoming } = req.query;
      const filter = {};

      if (category) filter.category = category;
      if (upcoming === "true") filter.date = { $gte: new Date() };

      const events = await Event.find(filter)
        .populate("creator", "name avatar")
        .populate("attendees", "name avatar")
        .sort({ date: 1 });

      res.status(200).send(events);
    } catch (error) {
      res.status(500).send({ msg: "Error al obtener eventos", error });
    }
  },

  // Confirmar asistencia
  attend: async (req, res) => {
    try {
      const { event_id } = req.params;
      const { user_id } = req.user;

      const event = await Event.findById(event_id);
      if (!event) return res.status(404).send({ msg: "Evento no encontrado" });

      const isAttending = event.attendees.some(attendee => attendee.toString() === user_id);

      if (isAttending) {
        event.attendees = event.attendees.filter(attendee => attendee.toString() !== user_id);
      } else {
        event.attendees.push(user_id);
      }

      await event.save();
      res.status(200).send(event);
    } catch (error) {
      res.status(500).send({ msg: "Error al confirmar asistencia", error });
    }
  },

  // Obtener eventos creados por un usuario
  getByCreator: async (req, res) => {
    try {
      const { user_id } = req.params;
      const events = await Event.find({ creator: user_id }).sort({ date: -1 });
      res.status(200).send(events);
    } catch (error) {
      res.status(500).send({ msg: "Error al obtener eventos del creador", error });
    }
  },

  // Eliminar evento (solo creador)
  delete: async (req, res) => {
    try {
      const { event_id } = req.params;
      const { user_id } = req.user;

      const event = await Event.findOneAndDelete({ 
        _id: event_id, 
        creator: user_id 
      });

      if (!event) {
        return res.status(404).send({ msg: "Evento no encontrado o no autorizado" });
      }

      res.status(200).send({ msg: "Evento eliminado" });
    } catch (error) {
      res.status(500).send({ msg: "Error al eliminar evento", error });
    }
  }
};