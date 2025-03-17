const tharavModel = require("../models/tharavModel");
const path = require("path");
const fs = require("fs");

// Get all Tharav records
// const getTharav = async (req, res) => {
//     try {
//         const results = await tharavModel.getAllTharav();
//         res.json(results);
//     } catch (err) {
//         console.error("Error fetching Tharavs:", err);
//         res.status(500).json({ error: "Database error" });
//     }
// };

const getTharav = async (req, res) => {
    try {
        const { meeting_number, school_id } = req.query;

        if (!meeting_number || !school_id) {
            return res.status(400).json({ error: "Meeting Number and School ID are required" });
        }

        const results = await tharavModel.getTharav(meeting_number, school_id);
        res.json(results);
    } catch (err) {
        console.error("Error fetching Tharavs:", err);
        res.status(500).json({ error: "Database error" });
    }
};


// Add a new Tharav record
const addTharav = async (req, res) => {
    try {
        let photoPath = "";
        if (req.file) {
            photoPath = `/uploads/${req.file.filename}`;
        }

        const { nirnay_reord } = req.body;
        if (!nirnay_reord) {
            return res.status(400).json({ error: "Invalid data" });
        }

        let recordToSave = nirnay_reord;
        if (photoPath) {
            const recordParts = nirnay_reord.split("|");
            if (recordParts.length > 4) {
                recordParts[4] = photoPath;
                recordToSave = recordParts.join("|");
            } else {
                return res.status(400).json({ error: "Invalid record format" });
            }
        }

        const result = await tharavModel.insertTharav(recordToSave);
        res.json({
            nirnay_id: result.insertId,
            nirnay_reord: recordToSave,
        });

    } catch (err) {
        console.error("Error adding Tharav:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Update a Tharav record
const updateTharav = async (req, res) => {
    try {
        const { id } = req.params;
        let photoPath = "";

        if (req.file) {
            photoPath = `/uploads/${req.file.filename}`;
        }

        const { nirnay_reord } = req.body;
        if (!nirnay_reord) {
            return res.status(400).json({ error: "Invalid data" });
        }

        let recordToSave = nirnay_reord;
        if (photoPath) {
            const recordParts = nirnay_reord.split("|");
            if (recordParts.length > 4) {
                recordParts[4] = photoPath;
                recordToSave = recordParts.join("|");
            } else {
                return res.status(400).json({ error: "Invalid record format" });
            }
        }

        const result = await tharavModel.updateTharav(id, recordToSave);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Tharav not found" });
        }

        res.json({ message: "Tharav updated successfully", updated_record: recordToSave });
    } catch (err) {
        console.error("Error updating Tharav:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Delete a Tharav record (soft delete)
const deleteTharav = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await tharavModel.deleteTharav(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Tharav not found" });
        }

        res.json({ message: "Tharav deleted successfully (soft delete)" });
    } catch (err) {
        console.error("Error deleting Tharav:", err);
        res.status(500).json({ error: "Database error" });
    }
};


// Export controller functions
module.exports = {
    // getTharav,
    addTharav,
    updateTharav,
    deleteTharav,
    getTharav,
};
