export const uploadImage = async (req, res) => {
  console.log("🖼️ === UPLOAD IMAGE DEBUG START ===");
  console.log("📊 Request Info:", {
    method: req.method,
    url: req.url,
    contentType: req.get('content-type'),
    hasFiles: !!req.files,
    filesKeys: req.files ? Object.keys(req.files) : []
  });

  try {
    // Dynamic import to catch config errors
    console.log("📦 Importing Cloudinary...");
    const cloudinaryModule = await import("../config/cloudinary.js");
    const cloudinary = cloudinaryModule.default;
    console.log("✅ Cloudinary imported successfully");

    // Check for file
    const file = req.files?.image;
    if (!file) {
      console.error("❌ No file received");
      console.log("Available files:", req.files);
      return res.status(400).json({ 
        error: "No image file provided",
        received: Object.keys(req.files || {}),
        expected: "image"
      });
    }

    console.log("📄 File details:", {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      mimetype: file.mimetype,
      encoding: file.encoding,
      hasData: !!file.data,
      dataSize: file.data?.length || 0
    });

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      console.error("❌ Invalid file type:", file.mimetype);
      return res.status(400).json({ 
        error: "File must be an image",
        received: file.mimetype 
      });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error("❌ File too large:", file.size);
      return res.status(400).json({ 
        error: "File too large. Maximum size is 10MB",
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
    }

    console.log("🚀 Starting Cloudinary upload...");
    
    // Test Cloudinary connection first
    try {
      const pingResult = await cloudinary.api.ping();
      console.log("✅ Cloudinary ping successful:", pingResult);
    } catch (pingError) {
      console.error("❌ Cloudinary ping failed:", pingError);
      return res.status(500).json({
        error: "Cloudinary connection failed",
        details: pingError.message,
        cloudinary_config: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "MISSING",
          api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
          api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING"
        }
      });
    }

    // Upload to Cloudinary with Promise wrapper
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: process.env.CLOUDINARY_FOLDER || "notes_images",
          resource_type: "image",
          public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
          overwrite: true,
          invalidate: true
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("✅ Cloudinary upload successful:", {
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              size: result.bytes
            });
            resolve(result);
          }
        }
      );

      console.log("📤 Sending file data to Cloudinary...");
      uploadStream.end(file.data);
    });

    // Success response
    console.log("🎉 Upload completed successfully!");
    res.json({ 
      imageUrl: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      size: uploadResult.bytes,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("💥 Upload controller error:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    
    res.status(500).json({ 
      error: "Image upload failed",
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log("🏁 === UPLOAD IMAGE DEBUG END ===\n");
  }
};