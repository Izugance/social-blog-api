import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import connectDB from "../config/connectDB.js";
import { Post, Comment } from "../models/Blog.js";
import { LikedPost } from "../models/LikedPost.js";
import { LikedComment } from "../models/LikedComment.js";
import { ResourceNotFoundError } from "../errors/index.js";
import { getPaginationParams } from "./utils/getPaginationParams.js";

/** GET */
const getAllPosts = asyncHandler(async (req, res) => {
  // Add query supports for posts created in a particular date.
  // Send data to indicate next page, if any.
  const page = Number(req.query.page) || 1;
  const _limit = Number(req.query.limit) || 10;
  const { skip, limit } = getPaginationParams(_limit, page);
  const posts = await Post.find().skip(skip).limit(limit);
  res.status(StatusCodes.OK).json({ posts });
});

/** POST */
const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({
    poster: req.user.userId,
    title: req.body.title,
    body: req.body.body,
  });
  res.status(StatusCodes.CREATED).json({ post });
});

/** GET */
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ResourceNotFoundError(
      `Post with id ${req.params.postId} does not exist`
    );
  }

  res.status(StatusCodes.OK).json({ post });
});

/** PATCH */
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    {
      _id: req.params.postId,
      poster: req.user.userId,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!post) {
    throw new ResourceNotFoundError(
      `Post with id ${req.params.postId} does not exist for user ${
        req.user.userId || "anonymous"
      }`
    );
  }

  res.status(StatusCodes.OK).json({ post });
});

/** DELETE */
const deletePost = asyncHandler(async (req, res) => {
  const connection = await connectDB();
  const session = await connection.startSession();

  await session.withTransaction(async () => {
    const post = await Post.findOneAndRemove({
      _id: req.params.postId,
      poster: req.user.userId,
    });

    if (!post) {
      throw new ResourceNotFoundError(
        `Post with id ${req.params.postId} does not exist for user ${
          req.user.userId || "anonymous"
        }`
      );
    }

    // Delete the associated LikedPosts.
    await LikedPost.deleteMany({ post });
    res.status(StatusCodes.OK).json({ post });
  });

  await session.endSession();
  await connection.close();
});

/** PATCH */
const likePost = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const connection = await connectDB();
  const session = await connection.startSession();

  await session.withTransaction(async () => {
    // Raises an exception if a duplicate liked post is created.
    // This arrangement guards against multiple increments from a user.
    await LikedPost.create({ user: userId, post: postId });

    const post = await Post.findByIdAndUpdate(postId, {
      $inc: { likes: 1 },
    });

    if (!post) {
      throw new ResourceNotFoundError(`Post ${postId} does not exist`);
    }

    res
      .status(StatusCodes.OK)
      .json({ msg: `User ${userId} liked post ${postId}` });
  });

  await session.endSession();
  await connection.close();
});

/** PATCH */
const unlikePost = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const connection = await connectDB();
  const session = await connection.startSession();

  await session.withTransaction(async () => {
    // Attempting to delete the associated LikedPost first guards against
    // decrementing likes beyond 0.
    const likedPost = await LikedPost.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (!likedPost) {
      throw new ResourceNotFoundError(
        `User ${req.user.userId} has not liked post ${postId}`
      );
    }

    // Decrement post likes.
    await Post.findByIdAndUpdate(postId, {
      $inc: { likes: -1 },
    });

    res
      .status(StatusCodes.OK)
      .json({ msg: `User ${userId} unliked post ${postId}` });
  });

  await session.endSession();
  await connection.close();
});

/** GET */
// -------------------------------------------------------------------------------PAGINATE ME
const getPostComments = asyncHandler(async (req, res) => {
  // Consider putting an 'all' query param to retrieve all. Make default
  // approach to retrieve most recent comments from post.
  const post = await Post.findOne({ _id: req.params.postId }).select(
    "comments"
  );

  if (!post)
    throw new ResourceNotFoundError(
      `Post with id ${req.params.postId} does not exist`
    );

  const comments = post.comments;
  res.status(StatusCodes.OK).json({ comments, count: comments.length });
});

/** GET */
const getCommentComments = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.commentId }).select(
    "comments"
  );

  if (!comment)
    throw new ResourceNotFoundError(
      `Post with id ${req.params.postId} does not exist`
    );

  const comments = comment.comments;
  res.status(StatusCodes.OK).json({ comments, count: comments.length });
});

/** POST */
const createPostComment = asyncHandler(async (req, res) => {
  const connection = await connectDB();
  const session = await connection.startSession();

  await session.withTransaction(async () => {
    const comment = await Comment.create({
      poster: req.user.userId,
      postModel: "Post",
      post: req.params.postId,
      body: req.body.body,
    });
    // Update comments for post. Can we use an insertion sort mechanism to
    // make this cleaner?
    await Post.updateComments(req.params.postId);
    res.status(StatusCodes.CREATED).json({ comment });
  });

  await session.endSession();
  await connection.close();
});

/** POST */
const createCommentComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({
    poster: req.user.userId,
    postModel: "Comment",
    post: req.params.commentId,
    body: req.body.body,
  });
  res.status(StatusCodes.CREATED).json({ comment });
});

/** GET */
const getComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ResourceNotFoundError(
      `Comment with id ${req.params.commentId} does not exist
      }`
    );
  }

  res.status(StatusCodes.OK).json({ comment });
});

/** DELETE */
const deleteComment = asyncHandler(async (req, res) => {
  const connection = await connectDB();
  const session = await connection.startSession();

  await session.withTransaction(async () => {
    const comment = await Comment.findOneAndRemove({
      _id: req.params.commentId,
      poster: req.user.userId,
    });

    if (!comment) {
      throw new ResourceNotFoundError(
        `Comment with id ${req.params.commentId} does not exist for user ${
          req.user.userId || "anonymous"
        }`
      );
    }

    // Delete the associated LikedComments.
    await LikedComment.deleteMany({
      post: req.params.commentId,
      user: req.user.userId,
    });

    // Update array of recent comments if a recent comment is deleted
    // for a post.
    if (comment.postModel === "Post") {
      await Post.updateComments(comment.post);
    }

    res.status(StatusCodes.OK).json({ comment });
  });

  await session.endSession();
  await connection.close();
});

/** PATCH */
const likeComment = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const commentId = req.params.commentId;
  const connection = await connectDB();
  const session = await connection.startSession();

  await session.withTransaction(async () => {
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $inc: { likes: 1 },
    });

    if (!comment) {
      throw new ResourceNotFoundError(`Comment ${commentId} does not exist`);
    }

    await LikedComment.create({ user: userId, comment: commentId });

    res
      .status(StatusCodes.OK)
      .json({ msg: `User ${userId} liked comment ${commentId}` });
  });

  await session.endSession();
  await connection.close();
});

/** DELETE */
const unlikeComment = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const commentId = req.params.commentId;
  const connection = await connectDB();
  const session = await connection.startSession();

  await session.withTransaction(async () => {
    // Attempting to delete the associated LikedComment first guards against
    // decrementing likes beyond 0.
    const likedComment = await LikedComment.findOneAndDelete({
      user: userId,
      comment: commentId,
    });

    if (!likedComment) {
      throw new ResourceNotFoundError(
        `User ${req.user.userId} has not liked comment ${commentId}`
      );
    }

    await Comment.findByIdAndUpdate(commentId, {
      $inc: { likes: -1 },
    });

    res
      .status(StatusCodes.OK)
      .json({ msg: `User ${userId} unliked comment ${commentId}` });
  });

  await session.endSession();
  await connection.close();
});

export {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostComments,
  getCommentComments,
  createPostComment,
  createCommentComment,
  getComment,
  deleteComment,
  likeComment,
  unlikeComment,
};
