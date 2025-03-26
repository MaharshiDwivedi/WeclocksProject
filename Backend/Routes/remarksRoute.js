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

// Create remark
router.post("/", upload.single("remarkPhoto"), remarksController.create);

// Get remarks by tharavNo
router.get("/", remarksController.getRemarksByTharavNo);

// Update remark
router.put("/:id", upload.single("remarkPhoto"), remarksController.updateRemark);

// Delete remark
router.delete("/:id", remarksController.deleteRemark);

module.exports = router;