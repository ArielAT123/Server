import mongoose from "mongoose";


const StorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  media: { type: String, required: true }, // Imagen o video
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    index: { expires: 0 } // Eliminación automática
  },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const Story = mongoose.model("Story", StorySchema);