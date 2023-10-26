import express from "express";

import authMiddleware from "../middleware/auth.js";
import {
  getUserByEmail,
  getUserFollowing,
  getUserFollowers,
  getUserLikedPosts,
  getUserPosts,
  followUser,
  unfollowUser,
} from "../controllers/user.js";

const router = express.Router();

router.route("/:email").get(getUserByEmail);
router.route("/:userId/posts").get(getUserPosts);
router.route("/:userId/following").get(getUserFollowing);
router.route("/:userId/followers").get(getUserFollowers);
router.route("/:userId/likes").get(getUserLikedPosts);
router.route("/:userId/follow").post(authMiddleware, followUser);
router.route("/:userId/unfollow").delete(authMiddleware, unfollowUser);

export default router;
