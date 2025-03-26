import express from "express";
import { ProductController } from "../controllers/product.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.post("/new-product/:user", [mdAuth.asureAuth], ProductController.create);
router.get("/product",[mdAuth.asureAuth],ProductController.getAll);
router.get("/product/user/:user_id",[mdAuth.asureAuth],ProductController.getByUser);
router.put("/product/:id", [mdAuth.asureAuth], ProductController.update);
router.delete("/product/:id", [mdAuth.asureAuth], ProductController.remove);

export const productRoutes = router;
