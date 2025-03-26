import express from "express";
import { LikeController } from "../controllers/like.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.post("/like/:user", [mdAuth.asureAuth], LikeController.addLike);
router.delete("/like:post_id", [mdAuth.asureAuth], LikeController.removeLike);
router.get("/like/total/:post_id", [mdAuth.asureAuth] ,LikeController.getTotalLikes);
router.get("/like/check/:post_id", [mdAuth.asureAuth], LikeController.hasLiked);

export const likeRoutes = router;
