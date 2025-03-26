import express from "express";
import { PostController } from "../controllers/post.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.post("/post", [mdAuth.asureAuth], PostController.create);
router.get("/post", PostController.getAll);
router.get("/post/user/:user_id", [mdAuth.asureAuth] ,PostController.getByUser);
router.delete("/post/:id", [mdAuth.asureAuth], PostController.delete);
router.put("/post/:id", [mdAuth.asureAuth], PostController.update);

export const postRoutes = router;
