import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("Comment", CommentSchema);
