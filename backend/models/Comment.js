import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    name: { type: String, required: true }, // Allow anonymous names for non-logged-in users
    email: { type: String }, // Optional email
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Comment', commentSchema);