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
    minlength: [1, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    name: { 
      type: String, 
      required: true,
      trim: true,
      minlength: [1, 'Author name is required'],
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    email: { 
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          // Only validate if email is provided (it's optional)
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    }
  },
  // For backward compatibility with old comment structure
  authorName: {
    type: String,
    trim: true
  },
  authorEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  approved: {
    type: Boolean,
    default: true // Auto-approve comments (you can change this to false for moderation)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Index for faster queries
commentSchema.index({ blogId: 1, createdAt: -1 });
commentSchema.index({ approved: 1 });

// Virtual for getting author name (supports both old and new structure)
commentSchema.virtual('authorDisplayName').get(function() {
  return this.author?.name || this.authorName || 'Guest';
});

// Virtual for getting author email (supports both old and new structure)
commentSchema.virtual('authorDisplayEmail').get(function() {
  return this.author?.email || this.authorEmail || null;
});

// Pre-save middleware to handle data migration
commentSchema.pre('save', function(next) {
  // If using old structure, migrate to new structure
  if (this.authorName && !this.author?.name) {
    this.author = this.author || {};
    this.author.name = this.authorName;
    if (this.authorEmail) {
      this.author.email = this.authorEmail;
    }
  }
  
  // Ensure we have required fields
  if (!this.author?.name && !this.authorName) {
    return next(new Error('Author name is required'));
  }
  
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Comment', commentSchema);