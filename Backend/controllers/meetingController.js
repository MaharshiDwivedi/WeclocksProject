const Meeting = require("../models/meetingModel");

async function getMeetings(req, res) {
  try {
    const meetings = await Meeting.getAllMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
}

async function createMeeting(req, res) {
  try {
    const result = await Meeting.addMeeting(req.body);
    res.status(201).json({ message: "Meeting added successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to add meeting" });
  }
}

async function updateMeeting(req, res) {
  try {
    const result = await Meeting.updateMeeting(req.params.id, req.body);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json({ message: "Meeting updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to update meeting" });
  }
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