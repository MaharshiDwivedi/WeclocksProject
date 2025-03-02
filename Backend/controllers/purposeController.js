const Purpose = require("../models/purposeModel");

// Get all members
const getMPurpose = async (req, res) => {
  try {
    const results = await Purpose.getAllPurposeMembers();
    res.json(results);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Insert a new member
const addPurpose = async (req, res) => {
  const { member_record } = req.body;

  if (!member_record) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const result = await Purpose.insertPurposeMembers(member_record);
    res.json({
      member_id: result.insertId,
      member_record: member_record,
    });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Update a member
const updatePurpose = async (req, res) => {
  const { member_record } = req.body;
  const { id } = req.params;

  if (!member_record) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const result = await Purpose.updatePurposeMembers(id, member_record);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json({ message: "Member updated successfully", updated_record: member_record });
  } catch (err) {
    console.error("Error updating member:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete a member
const deletePurpose = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Purpose.deletePurposeMembers(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  getMPurpose,
  addPurpose,
  updatePurpose,
  deletePurpose,
};
