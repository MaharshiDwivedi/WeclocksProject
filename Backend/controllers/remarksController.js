const connection = require("../Config/Connection"); 

exports.create = async (req, res) => {
  try {
    const { tharavNo, remarkDate, remarkText, actualExpense } = req.body;
    const remarkPhoto = req.file ? req.file.path : null;

    const nirnay_remarks_record = `${tharavNo} | meeting no. | schoolid | Userid | ${remarkText} | ${remarkPhoto} | ${actualExpense} | head_id | ${new Date().toISOString()} | ${new Date().toISOString()}`;

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

    // ✅ Fix: Use connection to execute query
    const [result] = await connection.query(query, values);

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error in create function:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
