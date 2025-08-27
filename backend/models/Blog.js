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
    refPath: 'author.type', // Dynamically reference the model based on author.type
  },
  type: {
    type: String,
    enum: ['Admin', 'User'],
    required: true,
  },
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

export default mongoose.model('Blog', blogSchema);