import { FeedController } from "../controllers/feed.js";
import { mdAuth } from "../middlewares/authenticated.js";
import express from "express";

const router = express.Router();

router.get("/feed", [mdAuth.asureAuth], FeedController.getFeed);
export const feedRoutes = router;