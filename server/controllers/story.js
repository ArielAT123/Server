import { Story } from "../models/story.js";
import { Follow } from "../models/Follow.js";
import { getFilePath } from "../utils/index.js"; // Usa tu función para guardar archivos

async function createStory(req, res) {
  try {
    const { user_id } = req.user;
    const { media } = req.files; // Requiere multer

    const story = new Story({
      user: user_id,
      media: getFilePath(media), // Ej: "/uploads/stories/image.jpg"
    });

    await story.save();
    res.status(201).send(story);
  } catch (error) {
    res.status(500).send({ msg: "Error al subir la historia", error });
  }
}
async function deleteStory(req, res) {
    try {
      const { user_id } = req.user;
      const { story_id } = req.params;
  
      // 1. Verificar que la story exista y pertenezca al usuario
      const story = await Story.findOne({
        _id: story_id,
        user: user_id // Solo el creador puede borrarla
      });
  
      if (!story) {
        return res.status(404).send({ 
          success: false,
          msg: "Historia no encontrada o no tienes permisos para eliminarla" 
        });
      }
  
      // 2. Eliminar la story
      await Story.findByIdAndDelete(story_id);
  
      // 3. Opcional: Eliminar el archivo físico del servidor (ej: usando fs)
      // const fs = require("fs");
      // fs.unlinkSync(path.join(__dirname, "../", story.media));
  
      res.status(200).send({ 
        success: true,
        msg: "Historia eliminada correctamente" 
      });
  
    } catch (error) {
      res.status(500).send({ 
        success: false,
        msg: "Error al eliminar la historia",
        error: error.message 
      });
    }
  }
  
  
async function getStories(req, res) {
  try {
    const { user_id } = req.user;

    // Obtener historias de usuarios seguidos (no expiradas)
    const following = await Follow.find({ follower: user_id }).select("followed");
    const stories = await Story.find({
      user: { $in: following.map(f => f.followed) },
      expiresAt: { $gt: new Date() }, // Solo activas
    })
      .populate("user", "username avatar") // Info básica del usuario
      .sort({ createdAt: -1 });

    res.status(200).send(stories);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener historias", error });
  }
}

export const StoryController = { createStory, getStories, deleteStory};