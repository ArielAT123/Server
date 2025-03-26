import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    image: { type: String },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", ProductSchema);
