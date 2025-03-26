import { Follow } from "../models/Follow.js";

async function followUser(req, res) {
  try {
    const { user_id } = req.user;
    const { followed_id } = req.params;

    const alreadyFollow = await Follow.findOne({ follower: user_id, followed: followed_id });
    if (alreadyFollow) {
      return res.status(400).send({ msg: "Ya sigues a este usuario" });
    }

    const follow = new Follow({ follower: user_id, followed: followed_id });
    await follow.save();

    res.status(201).send({ msg: "Siguiendo usuario", follow });
  } catch (error) {
    res.status(500).send({ msg: "Error al seguir usuario", error });
  }
}

async function unfollowUser(req, res) {
  try {
    const { user_id } = req.user;
    const { followed_id } = req.params;

    const result = await Follow.findOneAndDelete({ follower: user_id, followed: followed_id });

    if (!result) {
      return res.status(404).send({ msg: "No estabas siguiendo a este usuario" });
    }

    res.status(200).send({ msg: "Dejaste de seguir al usuario" });
  } catch (error) {
    res.status(500).send({ msg: "Error al dejar de seguir", error });
  }
}

async function getFollowers(req, res) {
  try {
    const { id } = req.params;
    const followers = await Follow.find({ followed: id }).populate("follower", "-password");

    res.status(200).send(followers);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener seguidores", error });
  }
}

async function getFollowing(req, res) {
  try {
    const { id } = req.params;
    const following = await Follow.find({ follower: id }).populate("followed", "-password");

    res.status(200).send(following);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener seguidos", error });
  }
}

async function isFollowing(req, res) {
  try {
    const { user_id } = req.user;
    const { followed_id } = req.params;

    const exists = await Follow.findOne({ follower: user_id, followed: followed_id });

    res.status(200).send({ following: !!exists });
  } catch (error) {
    res.status(500).send({ msg: "Error al verificar seguimiento", error });
  }
}

export const FollowController = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
};
