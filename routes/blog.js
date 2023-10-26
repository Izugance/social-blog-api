import express from "express";

import authMiddleware from "../middleware/auth.js";
import {
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
} from "../controllers/blog.js";

const router = express.Router();

router.route("/").get(getAllPosts).post(authMiddleware, createPost);

router
  .route("/:postId")
  .get(getPost)
  .patch(authMiddleware, updatePost)
  .delete(authMiddleware, deletePost);

router
  .route("/:postId/comments")
  .get(getPostComments)
  .post(authMiddleware, createPostComment);

router
  .route("/comments/:commentId")
  .get(getComment)
  .delete(authMiddleware, deleteComment);

router
  .route("/comments/:commentId/comments")
  .get(getCommentComments)
  .post(authMiddleware, createCommentComment);

router
  .route("/:postId/likes")
  .post(authMiddleware, likePost)
  .delete(authMiddleware, unlikePost);

router
  .route("/comments/:commentId/likes")
  .post(authMiddleware, likeComment)
  .delete(authMiddleware, unlikeComment);

export default router;
