import express from 'express';
import { protect } from '../Middlewares/auth.js';

const router = express.Router();

router.get('/admin/dashboard', protect, (req, res) => {
  console.log("🔍 [dashboard] Access request from user:", req.user);
  
  // Keep string roles as they are in your system
  const roleNames = {
    'user': "user",
    'admin': "admin", 
    'editor': "editor",
    'superadmin': "superadmin"
  };
  
  res.json({ 
    message: "Admin/Editor dashboard access granted", 
    user: {
      ...req.user,
      role: req.user.role, // Keep the string role
      roleName: roleNames[req.user.role] || "unknown"
    },
    timestamp: new Date().toISOString()
  });
});

export default router;