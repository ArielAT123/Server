import express from "express";
import { EventController } from "../controllers/event.js";
import { mdAuth } from "../middlewares/authenticated.js";
import multer from "multer";

const upload = multer({ dest: "./uploads/events" });
const router = express.Router();

// Crear evento (con imagen opcional)
router.post("/", [mdAuth.asureAuth, upload.single("image")], EventController.create);

// Obtener eventos (con filtros query: ?category=Taller&upcoming=true)
router.get("/", [mdAuth.asureAuth], EventController.getAll);

// Confirmar/cancelar asistencia
router.post("/attend/:event_id", [mdAuth.asureAuth], EventController.attend);

// Eventos de un usuario
router.get("/creator/:user_id", [mdAuth.asureAuth], EventController.getByCreator);

// Eliminar evento
router.delete("/:event_id", [mdAuth.asureAuth], EventController.delete);

export const eventRoutes = router;