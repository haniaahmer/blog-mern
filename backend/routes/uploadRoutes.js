import express from "express";
import uploadController from "../controllers/uploadController.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();


// Upload single image
router.post("/image", 
  protect, 
  authorize('admin', 'editor'), 
  uploadController.uploadSingle, 
  uploadController.handleSingleUpload
);

// Upload multiple images
router.post("/images", 
  protect, 
  authorize('admin', 'editor'), 
  uploadController.uploadMultiple, 
  uploadController.handleMultipleUpload
);

export default router;