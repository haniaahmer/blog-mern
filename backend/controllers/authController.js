import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/authModel.js';
import Admin from '../models/Admin.js';

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log("🔍 [adminLogin] Login attempt for username:", username);
  
  try {
    if (!username || !password) {
      console.warn("⚠️ [adminLogin] Missing credentials");
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    console.log("🔍 [adminLogin] Admin search result:", admin ? "Found" : "Not found");
    
    if (!admin) {
      console.warn("⚠️ [adminLogin] Admin not found for username:", username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("🔍 [adminLogin] Admin details:", {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    const isMatch = await admin.comparePassword(password);
    console.log("🔍 [adminLogin] Password match:", isMatch);
    
    if (!isMatch) {
      console.warn("⚠️ [adminLogin] Invalid password for username:", username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("✅ [adminLogin] Admin login successful:", {
      id: admin._id,
      username: admin.username,
      role: admin.role
    });

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('❌ [adminLogin] Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const editorLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log("🔍 [editorLogin] Login attempt for username:", username);
  
  try {
    if (!username || !password) {
      console.warn("⚠️ [editorLogin] Missing credentials");
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Try to find by email first (since User model uses email as username)
    const user = await User.findOne({ 
      $or: [
        { email: username },
        { name: username }
      ]
    });
    
    console.log("🔍 [editorLogin] User search result:", user ? "Found" : "Not found");
    
    if (!user || user.role !== 2) {
      console.warn("⚠️ [editorLogin] User not found or not an editor:", { 
        found: !!user, 
        role: user?.role 
      });
      return res.status(401).json({ error: 'Invalid credentials or not an editor' });
    }

    console.log("🔍 [editorLogin] User details:", {
      id: user._id,
      email: user.email,
      role: user.role
    });

    const isMatch = await user.comparePassword(password);
    console.log("🔍 [editorLogin] Password match:", isMatch);
    
    if (!isMatch) {
      console.warn("⚠️ [editorLogin] Invalid password for username:", username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("✅ [editorLogin] Editor login successful:", {
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Editor login successful',
      token,
      user: {
        id: user._id,
        username: user.email, // Use email as username for User model
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ [editorLogin] Editor login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const seedAdmin = async (req, res) => {
  console.log("🔍 [seedAdmin] Seeding admin user");
  
  try {
    // Check if admin exists by username instead of email
    const exists = await Admin.findOne({ username: 'admin' });
    console.log("🔍 [seedAdmin] Admin exists check:", exists ? "Already exists" : "Does not exist");
    
    if (exists) {
      // Log existing admin details for debugging
      console.log("🔍 [seedAdmin] Existing admin details:", JSON.stringify(exists.toObject(), null, 2));
      
      return res.json({ 
        ok: true, 
        seeded: false, 
        message: 'Admin already exists',
        admin: {
          username: exists.username,
          email: exists.email,
          role: exists.role
        }
      });
    }
    
    const adminData = {
      username: 'admin',
      email: 'admin@site.com',
      password: 'Admin@123',
      role: 1,
    };
    
    console.log("🔍 [seedAdmin] Creating admin with data:", adminData);
    
    const admin = new Admin(adminData);
    
    // Log before saving
    console.log("🔍 [seedAdmin] Admin object before save:", JSON.stringify(admin.toObject(), null, 2));
    
    await admin.save();
    
    // Log after saving
    console.log("🔍 [seedAdmin] Admin object after save:", JSON.stringify(admin.toObject(), null, 2));
    
    console.log("✅ [seedAdmin] Admin created successfully:", {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
    
    res.json({
      ok: true,
      seeded: true,
      username: 'admin',
      password: 'Admin@123',
      email: 'admin@site.com',
      role: 1,
      adminId: admin._id
    });
  } catch (error) {
    console.error('❌ [seedAdmin] Seed admin error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Add a new function to create an editor user
export const seedEditor = async (req, res) => {
  console.log("🔍 [seedEditor] Seeding editor user");
  
  try {
    const exists = await User.findOne({ email: 'editor@site.com' });
    console.log("🔍 [seedEditor] Editor exists check:", exists ? "Already exists" : "Does not exist");
    
    if (exists) {
      return res.json({ 
        ok: true, 
        seeded: false, 
        message: 'Editor already exists',
        editor: {
          email: exists.email,
          role: exists.role
        }
      });
    }
    
    const editor = new User({
      name: 'Editor User',
      email: 'editor@site.com',
      password: 'Editor@123',
      phone: '1234567890',
      address: 'Editor Address',
      answer: 'editor-security-answer',
      role: 2, // Editor role
    });
    
    await editor.save();
    console.log("✅ [seedEditor] Editor created successfully:", {
      id: editor._id,
      email: editor.email,
      role: editor.role
    });
    
    res.json({
      ok: true,
      seeded: true,
      email: 'editor@site.com',
      password: 'Editor@123',
      role: 2
    });
  } catch (error) {
    console.error('❌ [seedEditor] Seed editor error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};