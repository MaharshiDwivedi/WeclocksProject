const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Meeting = require("../models/meetingModel");

// Configure Multer for storing images in the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create folder if not exists
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Middleware for handling image uploads
const upload = multer({ storage }).single("image");

async function getMeetings(req, res) {
  try {
    const meetings = await Meeting.getAllMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
}

// Create a new meeting with image upload
async function createMeeting(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "Image upload failed" });
    try {
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "default.jpg"; // Store only the image path
      const meetingData = {
        ...req.body,
        image_url: imageUrl,
      };
      const result = await Meeting.addMeeting(meetingData);
      res.status(201).json({ message: "Meeting added successfully", result });
    } catch (error) {
      res.status(500).json({ error: "Failed to add meeting" });
    }
  });
}

// Update meeting with image
async function updateMeeting(req, res) {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "Image upload failed" });
    try {
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
      const updatedData = {
        ...req.body,
        image_url: imageUrl,
      };
      const result = await Meeting.updateMeeting(req.params.id, updatedData);
      if (result.error) return res.status(404).json(result);
      
      res.json({ message: "Meeting updated successfully", result });
    } catch (error) {
      res.status(500).json({ error: "Failed to update meeting" });
    }
  });
}

async function deleteMeeting(req, res) {
  try {
    const result = await Meeting.deleteMeeting(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Meeting not found" });
    }
    res.json({ message: "Meeting deleted successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete meeting" });
  }
}

module.exports = { getMeetings, createMeeting, updateMeeting, deleteMeeting };