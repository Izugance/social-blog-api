import mongoose from "mongoose";

// This model is used to keep track of like count logic for comments.
const likedCommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);

// Make them unique together.
likedCommentSchema.index({ user: 1, comment: 1 }, { unique: true });

export const LikedComment = mongoose.model("LikedComment", likedCommentSchema);
