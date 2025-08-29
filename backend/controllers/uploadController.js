import multer from "multer";
import path from "path";

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("🗂️ [upload] Saving file to uploads/:", file.originalname);
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const filename = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    console.log("📝 [upload] Generated filename:", filename);
    cb(null, filename);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  console.log("🔎 [upload] extname valid:", extname, "mimetype valid:", mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    console.warn("⚠️ [upload] Invalid file type:", file.originalname);
    cb(new Error("Error: Images only!"));
  }
}

// Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    console.log("🔍 [upload] Checking file type:", file.originalname, file.mimetype);
    checkFileType(file, cb);
  }
});

// Middleware functions
export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 5);

// Controller functions
export const handleSingleUpload = (req, res) => {
  try {
    console.log("🔍 [handleSingleUpload] Upload request from user:", req.user);
    
    if (!req.file) {
      console.warn("⚠️ [handleSingleUpload] No image file provided");
      return res.status(400).json({ error: "No image file provided" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    console.log("✅ [handleSingleUpload] Image uploaded successfully:", {
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
    console.error("❌ [handleSingleUpload] Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const handleMultipleUpload = (req, res) => {
  try {
    console.log("🔍 [handleMultipleUpload] Upload request from user:", req.user);
    
    if (!req.files || req.files.length === 0) {
      console.warn("⚠️ [handleMultipleUpload] No image files provided");
      return res.status(400).json({ error: "No image files provided" });
    }

    const files = req.files.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }));

    console.log("✅ [handleMultipleUpload] Images uploaded successfully:", {
      count: files.length,
      files: files.map(f => f.filename)
    });

    res.json({ files });
  } catch (error) {
    console.error("❌ [handleMultipleUpload] Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Export as default object
const uploadController = {
  uploadSingle,
  uploadMultiple,
  handleSingleUpload,
  handleMultipleUpload
};

export default uploadController;