import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { User } from "../models/User.js";
import { Follow } from "../models/Follow.js";
import { Post } from "../models/Blog.js";
import { getPaginationParams } from "./utils/getPaginationParams.js";

/** GET */
const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.status(StatusCodes.OK).json({ user });
});

/** GET */
const getUserPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const _limit = Number(req.query.limit) || 10;
  const { skip, limit } = getPaginationParams(_limit, page);
  const posts = await Post.find({ _id: req.params.userId })
    .skip(skip)
    .limit(limit);
  res.status(StatusCodes.OK).json({ posts });
});

/** GET */
const getUserFollowing = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const _limit = Number(req.query.limit) || 10;
  const { skip, limit } = getPaginationParams(_limit, page, 25, 50);
  try {
    const following = await User.getUserFollowing(
      req.params.userId,
      skip,
      limit
    );
    res.status(StatusCodes.OK).json({ following });
  } catch (error) {
    console.log(error);
  }
});

/** GET */
const getUserFollowers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const _limit = Number(req.query.limit) || 10;
  const { skip, limit } = getPaginationParams(_limit, page, 25, 50);
  const followers = await User.getUserFollowers(req.params.userId, skip, limit);
  res.status(StatusCodes.OK).json({ followers });
});

/** GET */
const getUserLikedPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 10;
  const _limit = Number(req.query.limit) || 10;
  const { skip, limit } = getPaginationParams(_limit, page, 25, 50);
  const likes = await User.getUserLikedPosts(req.params.userId, skip, limit);
  res.status(StatusCodes.OK).json({ likes });
});

/** POST */
const followUser = asyncHandler(async (req, res) => {
  const following = req.user.userId;
  const followed = req.params.userId;
  const _ = await Follow.create({
    following,
    followed,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ msg: `User '${following}' followed user '${followed}'` });
});

/** DELETE */
const unfollowUser = asyncHandler(async (req, res) => {
  const following = req.user.userId;
  const followed = req.params.userId;
  // Unfollowing is not symmetrical.
  const _ = await Follow.findOneAndRemove({
    following,
    followed,
  });
  res
    .status(StatusCodes.OK)
    .json({ msg: `User '${following}' unfollowed user '${followed}'` });
});

/** GET */
const getUserFeed = asyncHandler(async (req, res) => {});

export {
  getUserByEmail,
  getUserPosts,
  getUserFollowing,
  getUserFollowers,
  getUserLikedPosts,
  followUser,
  unfollowUser,
};
