import { Like } from "../models/Like.js";

async function addLike(req, res) {
  try {
    const { post_id } = req.body;
    const { user_id } = req.user;

    const existingLike = await Like.findOne({ post: post_id, user: user_id });
    if (existingLike) {
      return res.status(400).send({ msg: "Ya le diste like a esta publicación" });
    }

    const like = new Like({ user: user_id, post: post_id });
    await like.save();

    res.status(201).send({ msg: "Like agregado", like });
  } catch (error) {
    res.status(500).send({ msg: "Error al dar like", error });
  }
}

async function removeLike(req, res) {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;

    const deleted = await Like.findOneAndDelete({ post: post_id, user: user_id });

    if (!deleted) {
      return res.status(404).send({ msg: "No se encontró like para eliminar" });
    }

    res.status(200).send({ msg: "Like eliminado" });
  } catch (error) {
    res.status(500).send({ msg: "Error al eliminar like", error });
  }
}

async function getTotalLikes(req, res) {
  try {
    const { post_id } = req.params;

    const total = await Like.countDocuments({ post: post_id });
    res.status(200).send({ total });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener total de likes", error });
  }
}

async function hasLiked(req, res) {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;

    const liked = await Like.findOne({ post: post_id, user: user_id });
    res.status(200).send({ liked: !!liked });
  } catch (error) {
    res.status(500).send({ msg: "Error al verificar like", error });
  }
}

export const LikeController = {
  addLike,
  removeLike,
  getTotalLikes,
  hasLiked,
};
