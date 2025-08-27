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

// Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    console.log("🔍 [upload] Checking file type:", file.originalname, file.mimetype);
    checkFileType(file, cb);
  }
});

// Export middleware
export const uploadSingle = upload.single("image");        // for one file
export const uploadMultiple = upload.array("images", 5);   // for multiple files

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
    cb("Error: Images only!");
  }
}

