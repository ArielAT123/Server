import { Comment } from "../models/Comment.js";

export const CommentController = {
  create: async (req, res) => {
    try {
      const { post_id, text } = req.body;
      const user_id = req.user.user_id;

      const comment = new Comment({
        post: post_id,
        user: user_id,
        text,
      });

      await comment.save();
      const populated = await comment.populate("user", "-password");
      res.status(201).send(populated);
    } catch (error) {
      res.status(500).send({ msg: "Error al comentar", error });
    }
  },

  getByPost: async (req, res) => {
    const { post_id } = req.params;
    try {
      const comments = await Comment.find({ post: post_id })
        .sort({ createdAt: 1 })
        .populate("user", "-password");

      res.status(200).send(comments);
    } catch (error) {
      res.status(500).send({ msg: "Error al obtener comentarios", error });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      await Comment.findByIdAndDelete(id);
      res.status(200).send({ msg: "Comentario eliminado" });
    } catch (error) {
      res.status(500).send({ msg: "Error al eliminar comentario", error });
    }
  },
};
