import express from "express";
import { seedAdmin, seedEditor } from "../controllers/authController.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();

// Seed routes
router.post("/seed", seedAdmin);
router.post("/seed-editor", seedEditor);

// Dashboard route
router.get("/dashboard", protect, authorize(1, 2, 3), (req, res) => {
  console.log("🔍 [dashboard] Access request from user:", req.user);
  
  const roleNames = {
    0: "user",
    1: "admin", 
    2: "editor",
    3: "superadmin"
  };
  
  res.json({ 
    message: "Admin/Editor dashboard access granted", 
    user: {
      ...req.user,
      roleName: roleNames[req.user.role] || "unknown"
    },
    timestamp: new Date().toISOString()
  });
});

// Test route for debugging
router.get("/test", protect, (req, res) => {
  console.log("🔍 [test] Test request from user:", req.user);
  res.json({
    message: "Authentication test passed",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Debug route to check what's in the database
router.get("/debug-users", async (req, res) => {
  try {
    const { default: Admin } = await import("../models/Admin.js");
    const { default: User } = await import("../models/authModel.js");
    
    const admins = await Admin.find({}).select("username email role");
    const users = await User.find({}).select("name email role");
    
    console.log("🔍 [debug] Admins in database:", JSON.stringify(admins, null, 2));
    console.log("🔍 [debug] Users in database:", JSON.stringify(users, null, 2));
    
    res.json({
      admins: admins.map(admin => admin.toObject()),
      users: users.map(user => user.toObject()),
      message: "Database debug info"
    });
  } catch (error) {
    console.error("❌ [debug] Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;