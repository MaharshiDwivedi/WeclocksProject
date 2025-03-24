const Request = require("../models/fundreq_hmModels");

const getReq = async (req, res) => {
  try {
    const results = await Request.getAllReq();
    res.json(results);
  } catch (err) {
    console.error("Error fetching Request:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const addReq = async (req, res) => {
  const { demand_master_record } = req.body;
  const demand_status = "Pending";
  const demanded = "Yes";
  if (!demand_master_record) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const result = await Request.insertReq(demand_master_record, demand_status, demanded);
    res.json({
      demand_master_id: result.insertId,
      demand_master_record,
      demand_status,
      demanded,
    });
  } catch (err) {
    console.error("Error adding Request:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const updateReq = async (req, res) => {
  const { demand_master_record } = req.body;
  const { id } = req.params;

  if (!demand_master_record) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const result = await Request.updateReq(id, demand_master_record);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Request updated successfully", updated_record: demand_master_record });
  } catch (err) {
    console.error("Error updating Request:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const deleteReq = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Request.deleteReq(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("Error deleting Request:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const acceptReq = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Request.acceptReq(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Request accepted successfully" });
  } catch (err) {
    console.error("Error accepting Request:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const rejectReq = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: "Reason is required" });
  }

  try {
    const result = await Request.rejectReq(id, reason);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Request rejected successfully" });
  } catch (err) {
    console.error("Error rejecting Request:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  getReq,
  addReq,
  updateReq,
  deleteReq,
  acceptReq,
  rejectReq,
};