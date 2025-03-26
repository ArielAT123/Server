import express from "express";
import { NotificationController } from "../controllers/notification.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.post("/notification", [mdAuth.asureAuth], NotificationController.create);
router.get("/notification", [mdAuth.asureAuth], NotificationController.getMyNotifications);
router.put("/notification/:id/read", [mdAuth.asureAuth], NotificationController.markAsRead);
router.delete("/notification/:id", [mdAuth.asureAuth], NotificationController.remove);

export const notificationRoutes = router;
