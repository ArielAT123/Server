import express from "express";
import { FollowController } from "../controllers/follow.js";
import { mdAuth } from "../middlewares/authenticated.js";

const router = express.Router();

router.post("/:followed_id", [mdAuth.asureAuth], FollowController.followUser);
router.patch("/:followed_id", [mdAuth.asureAuth], FollowController.unfollowUser);
router.get("/followers/:id", [mdAuth.asureAuth],FollowController.getFollowers);
router.get("/following/:id",[mdAuth.asureAuth] ,FollowController.getFollowing);
router.get("/check/:followed_id", [mdAuth.asureAuth], FollowController.isFollowing);

export const followRoutes = router;
