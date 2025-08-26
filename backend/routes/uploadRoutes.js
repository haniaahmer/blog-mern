import express from "express";
import { uploadSingle, uploadMultiple } from "../Middlewares/upload.js";
import { protect, authorize } from "../Middlewares/auth.js";

const router = express.Router();

// Upload single image - Fixed authorization to use numeric roles
router.post("/image", protect, authorize(1, 2, 3), uploadSingle, (req, res) => {
  try {
    console.log("🔍 [uploadImage] Upload request from user:", req.user);
    
    if (!req.file) {
      console.warn("⚠️ [uploadImage] No image file provided");
      return res.status(400).json({ error: "No image file provided" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    console.log("✅ [uploadImage] Image uploaded successfully:", {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: fileUrl
    });
    
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("❌ [uploadImage] Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images - Fixed authorization to use numeric roles
router.post("/images", protect, authorize(1, 2, 3), uploadMultiple, (req, res) => {
  try {
    console.log("🔍 [uploadImages] Upload request from user:", req.user);
    
    if (!req.files || req.files.length === 0) {
      console.warn("⚠️ [uploadImages] No image files provided");
      return res.status(400).json({ error: "No image files provided" });
    }

    const files = req.files.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

    console.log("✅ [uploadImages] Images uploaded successfully:", {
      count: files.length,
      files: files.map(f => f.filename)
    });

    res.json({ files });
  } catch (error) {
    console.error("❌ [uploadImages] Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;