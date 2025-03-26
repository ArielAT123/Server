import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Quien genera
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Quien recibe
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW", "MENTION", "MESSAGE"],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // si aplica
    read: { type: Boolean, default: false },
    message: { type: String }, // para notificaciones personalizadas (opcional)
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", NotificationSchema);
