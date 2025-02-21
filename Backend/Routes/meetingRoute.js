const express = require("express");
const router = express.Router();
const MeetingController = require("../controllers/meetingController"); // Ensure the path is correct

// Ensure that all functions exist in MeetingController
if (
  !MeetingController.getMeetings ||
  !MeetingController.createMeeting ||
  !MeetingController.updateMeeting ||
  !MeetingController.deleteMeeting
) {
  throw new Error("One or more controller functions are undefined. Check meetingController.js");
}

router.get("/", MeetingController.getMeetings);
router.post("/", MeetingController.createMeeting);
router.put("/:id", MeetingController.updateMeeting);
router.delete("/:id", MeetingController.deleteMeeting);

module.exports = router;