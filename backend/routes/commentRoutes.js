// routes/commentRoutes.js
import express from "express";
import { 
  addComment, 
  getBlogComments, 
  approveComment, 
  rejectComment 
} from "../controllers/commentController.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/", addComment);
router.get("/blog/:blogId", getBlogComments);

// Admin routes
router.put("/:id/approve", protect, authorize("admin"), approveComment);
router.delete("/:id/reject", protect, authorize("admin"), rejectComment);

export default router;