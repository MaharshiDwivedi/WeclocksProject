const express = require("express");
const router = express.Router();
const tharavController = require("../controllers/tharavController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only .jpeg, .jpg, and .png formats allowed!"), false);
};

// Initialize multer with configuration
const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter
});

// Routes
// router.get("/", tharavController.getTharav);
router.get("/filter", tharavController.getTharav);
router.post("/", upload.single("photo"), tharavController.addTharav);
router.put("/:id", upload.single("photo"), tharavController.updateTharav);
router.delete("/:id", tharavController.deleteTharav);

module.exports = router;
