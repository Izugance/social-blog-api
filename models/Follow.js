import mongoose from "mongoose";

const followSchema = mongoose.Schema({
  following: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide a following user"],
  },
  followed: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide a followed user"],
  },
  // Should we have a "follows back" attr to reduce data duplication?
});

// Make them unique together.
followSchema.index({ user: 1, post: 1 }, { unique: true });

export const Follow = mongoose.model("Follow", followSchema);
