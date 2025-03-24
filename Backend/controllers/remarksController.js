// remarksController.js
const connection = require("../Config/Connection");

exports.create = async (req, res) => {
  try {
    const { tharavNo, remarkDate, remarkText, actualExpense, meetingNumber, schoolId, userId, headId } = req.body;
    const remarkPhoto = req.file ? req.file.path : null;

    const nirnay_remarks_record = `${tharavNo}|${meetingNumber}|${schoolId}|${userId}|${remarkText}|${remarkPhoto}|${actualExpense}|${headId}|${new Date().toISOString()}|${new Date().toISOString()}`;
    
    const query = `
      INSERT INTO tbl_new_smc_nirnay_remarks 
      (nirnay_remarks_record, previous_date, disable_edit_delete, status, sync_date_time) 
      VALUES (?, ?, ?, "Active", ?)
    `;

    const values = [
      nirnay_remarks_record,
      remarkDate || new Date(),
      0,
      1,
      new Date()
    ];

    const [result] = await connection.query(query, values);

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error in create function:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Add this function to fetch remarks by tharavNo
exports.getRemarksByTharavNo = async (req, res) => {
  try {
    const { tharavNo } = req.query;

    const [rows] = await connection.query(
      "SELECT * FROM tbl_new_smc_nirnay_remarks WHERE nirnay_remarks_record LIKE ? AND status='Active'",
      [`%${tharavNo}%`]
    );

    // Parse the nirnay_remarks_record into structured data
    const parsedRemarks = rows.map(remark => {
      const parts = remark.nirnay_remarks_record.split("|");
      return {
        ...remark,
        parsedData: {
          tharavNo: parts[0]?.trim(),
          meetingNumber: parts[1]?.trim(),
          schoolId: parts[2]?.trim(),
          userId: parts[3]?.trim(),
          remarkText: parts[4]?.trim(),
          remarkPhoto: parts[5]?.trim(),
          actualExpense: parts[6]?.trim(),
          headId: parts[7]?.trim(),
          createdAt: parts[8]?.trim(),
          updatedAt: parts[9]?.trim()
        }
      };
    });

    res.status(200).json(parsedRemarks);
  } catch (error) {
    console.error("Error fetching remarks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};