// routes/uploadRoutes.js
import express from "express";
import { upload } from "../Middlewares/upload.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();

// Upload single image
router.post("/image", protect, authorize("admin"), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ 
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
router.post("/images", protect, authorize("admin"), upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }
    
    const files = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
