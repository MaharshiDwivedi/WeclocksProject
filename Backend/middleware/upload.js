const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists with subdirectories
const ensureUploadsDir = (subfolder = "") => {
  const uploadDir = path.join(__dirname, "../uploads", subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Created uploads folder: ${uploadDir}`);
  }
  return uploadDir;
};

// Create configurable multer middleware
const configureUpload = (options = {}) => {
  // Default options
  const config = {
    fieldName: "file",
    fileSize: 10 * 1024 * 1024, // 10MB allowed
    fileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    subfolder: "", // Add subfolder option
    fileNaming: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
    ...options
  };

  // Set up storage with subfolder support
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = ensureUploadsDir(config.subfolder);
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

// Helper to delete files with subfolder support
const deleteFile = (filename, subfolder = "") => {
  if (!filename) return false;

  const filePath = path.join(__dirname, "../uploads", subfolder, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted file: ${filePath}`);
    return true;
  }
  return false;
};

// Pre-configured uploaders for specific use cases
const remarkPhotoMiddleware = configureUpload({
  fieldName: "remarkPhoto",
  fileTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  subfolder: "remarks"
}).single('remarkPhoto');

const tharavCompletionMiddleware = configureUpload({
  fieldName: "complete_tharav_img",
  fileTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  subfolder: "tharav_completion"
}).single('complete_tharav_img');

module.exports = {
  configureUpload,
  deleteFile,
  remarkPhotoMiddleware,  // Ready-to-use middleware
  tharavCompletionMiddleware  // Ready-to-use middleware
};