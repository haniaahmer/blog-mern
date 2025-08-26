import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);
