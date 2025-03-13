const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Meeting = require("../models/meetingModel");

// Configure Multer for storing images in the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create folder if it does not exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid overwriting
    const uniqueName = `${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Middleware for handling image uploads
const upload = multer({ storage }).single("image");

// Function to delete an image file
const deleteImage = (imageName) => {
  if (imageName && imageName !== "default.jpg") {
    const imagePath = path.join(__dirname, "../uploads", imageName);
    if (fs.existsSync(imagePath)) {
      console.log(`Deleting image: ${imagePath}`);
      fs.unlinkSync(imagePath); // Delete file
    }
  }
};

// // Get all meetings
// async function getMeetings(req, res) {
//   try {
//     const meetings = await Meeting.getAllMeetings();
//     res.json(meetings);
//   } catch (error) {
//     console.error("Error fetching meetings:", error);
//     res.status(500).json({ error: "Failed to fetch meetings" });
//   }
// }

// Get all meetings for a specific school
async function getMeetings(req, res) {
  try {
    const { school_id } = req.query; // Get school_id from query params
    if (!school_id) {
      return res.status(400).json({ error: "school_id is required" });
    }

    const meetings = await Meeting.getMeetingsBySchoolId(school_id);
    res.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
}

// Create a new meeting with image upload
async function createMeeting(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Image upload error:", err);
      return res.status(500).json({ error: "Image upload failed" });
    }

    try {
      console.log("Uploaded File:", req.file);
      const imageUrl = req.file ? req.file.filename : "default.jpg"; // Store only the image filename
      const meetingData = {
        ...req.body,
        image_url: imageUrl,
      };

      const result = await Meeting.addMeeting(meetingData);
      res.status(201).json({ message: "Meeting added successfully", result });
    } catch (error) {
      console.error("Error adding meeting:", error);
      res.status(500).json({ error: "Failed to add meeting" });
    }
  });
}

// Update meeting with image handling
async function updateMeeting(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Image upload error:", err);
      return res.status(500).json({ error: "Image upload failed" });
    }

    try {
      // 1. Get the meeting record
      const meetingRecord = await Meeting.getMeetingById(req.params.id);
      if (!meetingRecord) {
        console.error("Meeting not found");
        return res.status(404).json({ error: "Meeting not found" });
      }

      // 2. Extract the current image from the meeting record string
      const parts = meetingRecord.meeting_record.split("|");
      const currentImageName = parts[5]; // Image is at index 5 in the pipe-separated string
      
      // 3. Set the image URL (either keep existing or use new uploaded image)
      let imageUrl = currentImageName; // Keep the existing image by default
      
      // 4. If a new image is uploaded, delete the old one and use the new one
      if (req.file) {
        console.log("New image uploaded:", req.file.filename);
        // Only delete the old image if it's not the default image
        deleteImage(currentImageName);
        imageUrl = req.file.filename;
      }

      // 5. Update the meeting with the new data
      const updatedData = { 
        ...req.body, 
        image_url: imageUrl 
      };
      
      const result = await Meeting.updateMeeting(req.params.id, updatedData);

      res.json({ message: "Meeting updated successfully", result });
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ error: "Failed to update meeting" });
    }
  });
}

// Delete a meeting along with its image
async function deleteMeeting(req, res) {
  try {
    const meetingRecord = await Meeting.getMeetingById(req.params.id);
    if (!meetingRecord) {
      console.error("Meeting not found");
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Extract the image filename from the meeting record
    const parts = meetingRecord.meeting_record.split("|");
    const imageFilename = parts[5]; // Image is at index 5
    
    console.log("Deleting Meeting Data:", meetingRecord);
    // Delete the image file
    deleteImage(imageFilename);
    
    // Delete the meeting record
    const result = await Meeting.deleteMeeting(req.params.id);

    res.json({ message: "Meeting deleted successfully", result });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ error: "Failed to delete meeting" });
  }
}

module.exports = { getMeetings, createMeeting, updateMeeting, deleteMeeting };