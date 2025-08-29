import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'author.model', // Changed to 'author.model'
      },
      model: { // Changed from 'type' to 'model'
        type: String,
        enum: ['Admin', 'User'],
        required: true,
      },
      name: { // Add author name for easier access
        type: String,
        required: true
      }
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    excerpt: {
      type: String,
      default: '',
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique index on slug
blogSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model('Blog', blogSchema);