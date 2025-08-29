import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/authModel.js';
import Admin from '../models/Admin.js';

export const adminLogin = async (req, res) => {
  const { username, password, role } = req.body;
  console.log("🔍 [adminLogin] Login attempt:", { username, role });
  
  try {
    if (!username || !password || !role) {
      console.warn("⚠️ [adminLogin] Missing credentials or role");
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    if (!['admin', 'editor', 'superadmin'].includes(role)) {
      console.warn("⚠️ [adminLogin] Invalid role:", role);
      return res.status(400).json({ error: 'Invalid role' });
    }

    let user = null;

    // Check Admin collection for admin or superadmin
    if (role === 'admin' || role === 'superadmin') {
      user = await Admin.findOne({ username });
      console.log("🔍 [adminLogin] Admin search result:", user ? {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      } : "Not found");
      
      if (!user || user.role !== role) {
        return res.status(401).json({ error: 'Invalid credentials or role' });
      }
    } 
    // Check User collection for editor
    else if (role === 'editor') {
      user = await User.findOne({ 
        $or: [
          { email: username },
          { username: username }
        ],
        role: 'editor'
      });
      console.log("🔍 [adminLogin] Editor search result:", user ? {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      } : "Not found");
      
      if (!user || user.role !== 'editor') {
        return res.status(401).json({ error: 'Invalid credentials or not an editor' });
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log("🔍 [adminLogin] Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokenPayload = { 
      id: user._id.toString(), 
      role: user.role 
    };
    console.log("🔍 [adminLogin] Token payload:", tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("✅ [adminLogin] Login successful, token generated with role:", user.role);

    res.json({
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful`,
      token,
      user: {
        id: user._id,
        username: user.username || user.email,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ [adminLogin] Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const editorLogin = async (req, res) => {
  const { username, password } = req.body;
  console.log("🔍 [editorLogin] Login attempt:", { username });
  
  try {
    if (!username || !password) {
      console.warn("⚠️ [editorLogin] Missing credentials");
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find editor in User collection by username or email
    const editor = await User.findOne({ 
      $or: [
        { email: username },
        { username: username }
      ],
      role: 'editor' 
    });
    
    console.log("🔍 [editorLogin] Editor search result:", editor ? {
      id: editor._id,
      username: editor.username,
      email: editor.email,
      role: editor.role
    } : "Not found or not an editor");
    
    if (!editor) {
      return res.status(401).json({ error: 'Invalid credentials or not an editor' });
    }

    const isMatch = await editor.comparePassword(password);
    console.log("🔍 [editorLogin] Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokenPayload = { 
      id: editor._id.toString(), 
      role: editor.role 
    };
    console.log("🔍 [editorLogin] Token payload:", tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("✅ [editorLogin] Login successful, token generated");

    res.json({
      message: 'Editor login successful',
      token,
      user: {
        id: editor._id,
        username: editor.username,
        email: editor.email,
        role: editor.role,
      },
    });
  } catch (error) {
    console.error('❌ [editorLogin] Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;

    if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      user = await Admin.findById(decoded.id);
    } else if (decoded.role === 'editor') {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ 
      isAdmin: ['admin', 'superadmin', 'editor'].includes(user.role),
      user: {
        id: user._id,
        username: user.username || user.email,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify admin error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const seedAdmin = async (req, res) => {
  console.log("🔍 [seedAdmin] Seeding admin user");
  
  try {
    const exists = await Admin.findOne({ username: 'admin' });
    console.log("🔍 [seedAdmin] Admin exists check:", exists ? "Already exists" : "Does not exist");
    
    if (exists) {
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
      role: 'admin',
    };
    
    console.log("🔍 [seedAdmin] Creating admin with data:", adminData);
    
    const admin = new Admin(adminData);
    await admin.save();
    
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
      role: 'admin',
      adminId: admin._id
    });
  } catch (error) {
    console.error('❌ [seedAdmin] Seed admin error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const seedEditor = async (req, res) => {
  const { username = 'editor', email = 'editor@site.com', password = 'Editor@123' } = req.body;
  console.log("🔍 [seedEditor] Seeding editor user:", { username, email });
  
  try {
    const exists = await User.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });
    
    console.log("🔍 [seedEditor] Editor exists check:", exists ? "Already exists" : "Does not exist");
    
    if (exists) {
      return res.json({ 
        ok: true, 
        seeded: false, 
        message: 'Editor already exists',
        editor: {
          username: exists.username,
          email: exists.email,
          role: exists.role
        }
      });
    }
    
    const editor = new User({
      username,
      email,
      password,
      role: 'editor',
      // Add default values for required fields to avoid validation errors
      name: username || 'Editor User',
      phone: '000-000-0000',
      address: 'Editor Address',
      answer: 'editor-security'
    });
    
    await editor.save();
    console.log("✅ [seedEditor] Editor created successfully:", {
      id: editor._id,
      username: editor.username,
      email: editor.email,
      role: editor.role
    });
    
    res.json({
      ok: true,
      seeded: true,
      username: editor.username,
      email: editor.email,
      password: password,
      role: 'editor',
      editorId: editor._id
    });
  } catch (error) {
    console.error('❌ [seedEditor] Seed editor error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// New function to create multiple editors
export const seedMultipleEditors = async (req, res) => {
  const editors = [
    { username: 'editor1', email: 'editor1@site.com', password: 'Editor1@123' },
    { username: 'editor2', email: 'editor2@site.com', password: 'Editor2@123' },
    { username: 'editor3', email: 'editor3@site.com', password: 'Editor3@123' }
  ];

  console.log("🔍 [seedMultipleEditors] Seeding multiple editors");
  
  try {
    const results = [];
    
    for (const editorData of editors) {
      const exists = await User.findOne({ 
        $or: [
          { email: editorData.email },
          { username: editorData.username }
        ]
      });
      
      if (exists) {
        results.push({
          username: editorData.username,
          email: editorData.email,
          seeded: false,
          message: 'Editor already exists'
        });
        continue;
      }
      
      const editor = new User({
        username: editorData.username,
        email: editorData.email,
        password: editorData.password,
        role: 'editor',
        name: editorData.username,
        phone: '000-000-0000',
        address: 'Editor Address',
        answer: 'editor-security'
      });
      
      await editor.save();
      results.push({
        username: editorData.username,
        email: editorData.email,
        seeded: true,
        password: editorData.password,
        editorId: editor._id
      });
      
      console.log(`✅ [seedMultipleEditors] Editor ${editorData.username} created successfully`);
    }
    
    res.json({
      ok: true,
      results
    });
  } catch (error) {
    console.error('❌ [seedMultipleEditors] Seed multiple editors error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
const authController = {
  adminLogin,
  editorLogin,
  verifyAdmin,
  seedAdmin,
  seedEditor,
  seedMultipleEditors
};

export default authController;