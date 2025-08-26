import express from "express";
import { createComment, getCommentsByBlog } from "../controllers/commentController.js";

const router = express.Router();

router.post("/", createComment);
router.get("/blog/:blogId", getCommentsByBlog);

export default router;