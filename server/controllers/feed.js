import { Post } from "../models/Post.js";
import { Follow } from "../models/Follow.js";

async function getFeed(req, res) {
  try {
    const { user_id } = req.user;
    const { page = 1, limit = 10 } = req.query;

    // 1. Obtener IDs de usuarios seguidos + el propio usuario
    const following = await Follow.find({ follower: user_id }).select("followed");
    const followingIds = following.map(f => f.followed);
    followingIds.push(new mongoose.Types.ObjectId(user_id)); // Incluye tus posts

    // 2. Paginación y orden descendente
    const posts = await Post.find({ user: { $in: followingIds } })
      .populate("user", "username avatar") // Campos del usuario
      .populate("comments") // Opcional: si quieres mostrar comentarios
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 3. Contar likes (alternativa si no usas el array de likes en Post.js)
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likesCount = await Like.countDocuments({ post: post._id });
        return { ...post._doc, likesCount };
      })
    );

    res.status(200).send(postsWithLikes);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener el feed", error });
  }
}

export const FeedController = { getFeed };