import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    reason: { type: String, required: true },
    reviewed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", ReportSchema);
