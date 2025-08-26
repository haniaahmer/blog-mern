// routes/adminRoutes.js
import express from "express";
import { seedAdmin } from "../controllers/authController.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();

// DEV ONLY: Seed admin user
router.post("/seed", seedAdmin);

// Admin dashboard routes (protected)
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin dashboard", user: req.user });
});

export default router;