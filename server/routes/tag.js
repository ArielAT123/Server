import express from "express";
import { TagController } from "../controllers/tag.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.get("/hashtag/:tag",[mdAuth.asureAuth], TagController.getPostsByHashtag);
router.get("/mention/:username",[mdAuth.asureAuth], TagController.getPostsByMention);

export const tagRoutes = router;
