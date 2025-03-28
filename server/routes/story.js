import { StoryController } from "../controllers/story.js";
import { mdAuth } from "../middlewares/authenticated.js";
import uploadMiddleware from "../middlewares/upload.js";
import express from "express";

const router = express.Router();

router.post(
    "/stories",
    [mdAuth.asureAuth],       // Primero verifica autenticación
    uploadMiddleware.single("media"), // Luego procesa el archivo
    StoryController.createStory
);

router.get("/stories", [mdAuth.asureAuth], StoryController.getStories);

router.delete("/stories/:story_id", [mdAuth.asureAuth], StoryController.deleteStory);

export const StoryRoutes = router;
