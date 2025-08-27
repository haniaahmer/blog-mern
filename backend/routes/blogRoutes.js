import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  likeBlog,
} from "../controllers/blogController.js";
import { uploadMultiple } from "../Middlewares/upload.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/get", getBlogs);               // GET all blogs
router.get("/get/:slug", getBlogBySlug);     // GET single blog by slug

// Protected routes (Admin, Editor, )
router.post("/add", protect, authorize("admin", "editor"), uploadMultiple, createBlog);
router.put("/update/:id", protect, authorize("admin", "editor"), uploadMultiple, updateBlog);
router.delete("/delete/:id", protect, authorize("admin", "editor"), deleteBlog);

// Likes (optional: add protect if only logged-in users can like)
router.post("/get/:id/like", likeBlog);

export default router;
