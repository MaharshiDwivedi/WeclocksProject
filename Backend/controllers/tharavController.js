const connection = require('../Config/Connection'); 

// Get all Tharav records for a specific meeting and school
const getTharav = async (req, res) => {
    try {
        const { meeting_number, school_id } = req.query;

        if (!meeting_number || !school_id) {
            return res.status(400).json({ error: "Meeting Number and School ID are required" });
        }

        const sql = `
            SELECT * FROM tbl_new_smc_nirnay 
            WHERE (status = 'Active' OR work_status = 'Completed')
            AND SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 1), '|', -1) = ?
            AND SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 6), '|', -1) = ?
            ORDER BY nirnay_id DESC;
        `;
        const [rows] = await connection.query(sql, [meeting_number, school_id]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching Tharavs:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// Get   counts by school
const getTharavCountBySchool = async (req, res) => {
    try {
        const { school_id } = req.query;

        if (!school_id) {
            return res.status(400).json({ error: "School ID is required" });
        }

        const sql = `
            SELECT 
                SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 1), '|', -1) as meeting_number,
                COUNT(*) as count
            FROM tbl_new_smc_nirnay 
            WHERE status = 'Active'
            AND SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 6), '|', -1) = ?
            GROUP BY meeting_number
        `;
        
        const [results] = await connection.query(sql, [school_id]);
        res.json(results);
    } catch (err) {
        console.error("Error fetching Tharav counts:", err);
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

        const result = await connection.query("INSERT INTO tbl_new_smc_nirnay (nirnay_reord , status) VALUES (?,?)", [recordToSave, "Active"]);
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

        const result = await connection.query("UPDATE tbl_new_smc_nirnay SET nirnay_reord = ? WHERE nirnay_id = ?", [recordToSave, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Tharav not found" });
        }

        res.json({ message: "Tharav updated successfully", updated_record: recordToSave });
    } catch (err) {
        console.error("Error updating Tharav:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Delete a Tharav record
const deleteTharav = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await connection.query("UPDATE tbl_new_smc_nirnay SET status = 'Inactive' WHERE nirnay_id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Tharav not found" });
        }

        res.json({ message: "Tharav deleted successfully (soft delete)" });
    } catch (err) {
        console.error("Error deleting Tharav:", err);
        res.status(500).json({ error: "Database error" });
    }
};

module.exports = {
    getTharav,
    addTharav,
    updateTharav,
    deleteTharav,
    getTharavCountBySchool
};