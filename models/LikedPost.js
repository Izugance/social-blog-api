import mongoose from "mongoose";

const likedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

// Make them unique together.
likedPostSchema.index({ user: 1, post: 1 }, { unique: true });

export const LikedPost = mongoose.model("LikedPost", likedPostSchema);
