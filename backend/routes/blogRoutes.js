// Backend: server/routes/blogRoutes.js
import express from "express";
import { createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog, likeBlog } from "../controllers/blogController.js";
import { uploadMultiple } from "../Middlewares/upload.js"; // ← Change this import
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Use uploadMultiple instead of upload
router.post("/add", protect, uploadMultiple, createBlog); // ← Fix this line
router.get("/get", getBlogs);
router.get("/get/:slug", getBlogBySlug);
router.put("/update/:id", protect, uploadMultiple, updateBlog); // ← And this line
router.delete("/delete/:id", protect, deleteBlog);
router.post("/like/:id", likeBlog);

export default router;