// Backend: server/Middlewares/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads directory exists
const dir = "uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_, file, cb) => {
  const ok = /image\/(png|jpe?g|webp|gif)/.test(file.mimetype);
  cb(ok ? null : new Error("Only image files (png, jpg, jpeg, webp, gif) are allowed"), ok);
};

// Export the base Multer instance (configurable)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Optional: Export pre-configured middlewares for common use cases
// For multiple images (e.g., blogs)
export const uploadMultiple = upload.array("images", 5);

// For single image (e.g., /image route)
export const uploadSingle = upload.single("image");

// If you need a default export, export the base instance
export default upload;