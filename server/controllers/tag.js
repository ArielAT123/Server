import { Post } from "../models/Post.js";
import { User } from "../models/user.js";

async function getPostsByHashtag(req, res) {
  try {
    const { tag } = req.params;
    const posts = await Post.find({ hashtags: tag.toLowerCase() })
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ msg: "Error al buscar hashtag", error });
  }
}

async function getPostsByMention(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ msg: "Usuario no encontrado" });

    const posts = await Post.find({ text: new RegExp(`@${username}`, "i") })
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ msg: "Error al buscar menciones", error });
  }
}

export const TagController = {
  getPostsByHashtag,
  getPostsByMention,
};
