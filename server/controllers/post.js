import { Post } from "../models/Post.js";
import { extractHashtags, extractMentions } from "../utils/extractTags.js";
import { User } from "../models/user.js";
import { Notification } from "../models/Notification.js";

export const PostController = {
  create: async (req, res) => {
    try {
      const { text } = req.body;
      const user_id = req.user.user_id;

      const hashtags = extractHashtags(text);      // ✅ Hashtags extraídos
      const mentions = extractMentions(text);      // ✅ Menciones extraídas

      const post = new Post({
        user: user_id,
        text,
        hashtags,
        image: req.files?.image ? `/uploads/${req.files.image.name}` : null,
        video: req.files?.video ? `/uploads/${req.files.video.name}` : null,
      });

      // Crear notificaciones por menciones 
      for (const username of mentions) {
        const mentionedUser = await User.findOne({ username }); // Debes tener el campo `username` en el modelo User
        if (mentionedUser) {
          const notification = new Notification({
            sender: user_id,
            receiver: mentionedUser._id,
            type: "MENTION",
            post: post._id,
            message: `${username}, te mencionaron en una publicación.`,
          });
          await notification.save();
        }
      }

      await post.save();
      res.status(201).send(post);
    } catch (error) {
      res.status(500).send({ msg: "Error al crear publicación", error });
    }
  },

  getAll: async (req, res) => {
    try {
      const posts = await Post.find()
        .populate("user", "-password")
        .sort({ createdAt: -1 });

      res.status(200).send(posts);
    } catch (error) {
      res.status(500).send({ msg: "Error al obtener publicaciones", error });
    }
  },

  getByUser: async (req, res) => {
    const { user_id } = req.params;
    try {
      const posts = await Post.find({ user: user_id }).sort({ createdAt: -1 });
      res.status(200).send(posts);
    } catch (error) {
      res.status(500).send({ msg: "Error al obtener publicaciones del usuario", error });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      await Post.findByIdAndDelete(id);
      res.status(200).send({ msg: "Publicación eliminada" });
    } catch (error) {
      res.status(500).send({ msg: "Error al eliminar publicación", error });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
      const updatedPost = await Post.findByIdAndUpdate(id, { text }, { new: true });
      res.status(200).send(updatedPost);
    } catch (error) {
      res.status(500).send({ msg: "Error al editar publicación", error });
    }
  },
};
