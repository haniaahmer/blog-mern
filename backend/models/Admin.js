// models/Admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Schema for Admin user model
 * @typedef {Object} AdminSchema
 * @property {string} username - Unique username for the admin
 * @property {string} email - Unique email address for the admin
 * @property {string} password - Hashed password for the admin
 * @property {string} role - Role of the admin (admin or superadmin)
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
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin'],
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