import express from "express";
import { createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog, likeBlog } from "../controllers/blogController.js";
import { uploadMultiple } from "../Middlewares/upload.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();

router.get("/get", getBlogs);
router.get("/get/:slug", getBlogBySlug);
router.post("/add", protect, authorize(1, 2, 3), uploadMultiple, createBlog);
router.put("/update/:id", protect, authorize(1, 2, 3), uploadMultiple, updateBlog);
router.delete("/delete/:id", protect, deleteBlog);
router.post("/like/:id", likeBlog);

export default router;