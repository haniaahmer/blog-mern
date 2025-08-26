import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Schema for Admin user model
 * @typedef {Object} AdminSchema
 * @property {string} username - Unique username for the admin
 * @property {string} email - Unique email address for the admin
 * @property {string} password - Hashed password for the admin
 * @property {number} role - Role of the admin (1 for admin, 3 for superadmin)
 * @property {Date} createdAt - Timestamp when the admin was created
 */
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: function() {
      return `${this.username}@admin.com`;
    }
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 1, // 1 for admin, 3 for superadmin
    enum: [1, 3],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Pre-save hook to hash password before saving to database
 * @param {Function} next - Mongoose middleware next function
 */
adminSchema.pre('save', async function (next) {
  // Set email if not provided
  if (!this.email) {
    this.email = `${this.username}@admin.com`;
  }
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

/**
 * Compare provided password with stored hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Admin model
 * @module Admin
 */
export default mongoose.model('Admin', adminSchema);