const Member = require("../models/memberModel");

// Get all members
const getMembers = async (req, res) => {
  try {
    const results = await Member.getAllMembers();
    res.json(results);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Insert a new member
const addMember = async (req, res) => {
  const { member_record } = req.body;

  if (!member_record) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const result = await Member.insertMember(member_record);
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
const updateMember = async (req, res) => {
  const { member_record } = req.body;
  const { id } = req.params;

  if (!member_record) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const result = await Member.updateMember(id, member_record);
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
const deleteMember = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Member.deleteMember(id);
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
  getMembers,
  addMember,
  updateMember,
  deleteMember,
};
