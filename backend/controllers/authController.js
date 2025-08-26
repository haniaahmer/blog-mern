// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/authModel.js';
import Admin from '../models/Admin.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'User login successful',
      token,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const seedAdmin = async (req, res) => {
  try {
    const exists = await Admin.findOne({ email: 'admin@site.com' });
    if (exists) {
      return res.json({ ok: true, seeded: false, message: 'Admin already exists' });
    }
    const admin = new Admin({
      username: 'admin',
      email: 'admin@site.com',
      password: 'Admin@123',
      role: 'admin',
    });
    await admin.save();
    res.json({
      ok: true,
      seeded: true,
      email: 'admin@site.com',
      username: 'admin',
      password: 'Admin@123',
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};