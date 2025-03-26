import express from "express";
import { OrderController } from "../controllers/order.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.post("/order", [mdAuth.asureAuth], OrderController.create);
router.get("/order/buyer", [mdAuth.asureAuth], OrderController.getOrdersByBuyer);
router.get("/order/seller", [mdAuth.asureAuth], OrderController.getOrdersBySeller);
router.put("/order/:id/status", [mdAuth.asureAuth], OrderController.updateStatus);

export const orderRoutes = router;
