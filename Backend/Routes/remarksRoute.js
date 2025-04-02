const express = require("express");
const router = express.Router();
const remarksController = require("../controllers/remarksController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Get remarks - now uses nirnay_id instead of tharavNo
router.get("/", (req, res, next) => {
  if (!req.query.nirnay_id) {
    return res.status(400).json({ 
      success: false,
      message: "Nirnay ID is required" 
    });
  }
  next();
}, remarksController.getRemarksByNirnayId);

// Create remark
router.post("/", upload.single("remarkPhoto"), remarksController.create);

// Update remark
router.put("/:id", upload.single("remarkPhoto"), remarksController.updateRemark);

// Delete remark
router.delete("/:id", remarksController.deleteRemark);

module.exports = router;