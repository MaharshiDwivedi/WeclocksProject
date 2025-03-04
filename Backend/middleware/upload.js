const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Created 'uploads' folder.");
  }
  return uploadDir;
};

// Create configurable multer middleware
const configureUpload = (options = {}) => {
  const uploadDir = ensureUploadsDir();
  
  // Default options
  const config = {
    fieldName: "file", 
    fileSize: 10 * 1024 * 1024, // 10MB allowed
    fileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'], 
    fileNaming: (req, file, cb) => {
      const ext = path.extname(file.originalname); 
      cb(null, file.fieldname + '-' + Date.now() + ext);
    },
    ...options
  };
  
  // Set up storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: config.fileNaming
  });
  
  // Set up file filter
  const fileFilter = (req, file, cb) => {
    if (config.fileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${config.fileTypes.join(', ')} formats allowed!`), false);
    }
  };
  
  // Initialize multer with configuration
  return multer({
    storage: storage,
    limits: { fileSize: config.fileSize },
    fileFilter: fileFilter
  });
};

// Helper to delete files
const deleteFile = (filename) => {
  if (!filename) return false;
  
  const filePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted file: ${filePath}`);
    return true;
  }
  return false;
};

module.exports = {
  configureUpload,
  deleteFile
};
