import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    poster: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a poster ID"],
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    body: {
      type: String,
      required: [true, "Please provide a body"],
    },
    comments: [
      // Ten most recent comments. Enforced in the business logic.
      {
        commentId: { type: mongoose.Types.ObjectId, ref: "Comment" },
        createdAt: Date,
        body: String,
        likes: Number,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    poster: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a poster ID"],
    },
    post: {
      type: mongoose.Types.ObjectId,
      refPath: "postModel", // Look at "postModel" ppt to find the right model.
      required: [true, "Please provide a poster ID"],
    },
    postModel: {
      type: String,
      required: [true, "Please provide the model the comment is attached to"],
      enum: ["Post", "Comment"],
    },
    body: {
      type: String,
      required: [true, "Please provide a body"],
    },
    comments: [
      {
        // Assume few comments per comment.
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// This seems like a silly idea. Improve.
postSchema.static.updateComments = async function (postId) {
  const tenRecentComments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("_id createdAt body likes");
  await Post.findByIdAndUpdate(postId, { comments: tenRecentComments });
};

const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

export { Post, Comment };
