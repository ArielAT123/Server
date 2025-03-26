import mongoose from "mongoose";

const FollowSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followed: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Para evitar duplicados
FollowSchema.index({ follower: 1, followed: 1 }, { unique: true });

export const Follow = mongoose.model("Follow", FollowSchema);
