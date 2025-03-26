import express from "express";
import { CommentController } from "../controllers/comment.js";
import { mdAuth } from "../middlewares/index.js";

const router = express.Router();

router.post("/comm", [mdAuth.asureAuth], CommentController.create);
router.get("/comm/:post_id",[mdAuth.asureAuth], CommentController.getByPost);
router.delete("/comm/:id", [mdAuth.asureAuth], CommentController.delete);

// ✅ Exportarlo con nombre para que funcione con export * from "./comment.js"
export const commentRoutes = router;
