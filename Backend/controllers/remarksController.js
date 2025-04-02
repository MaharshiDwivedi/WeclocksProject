const connection = require("../Config/Connection");

// Helper function to update demand record
const updateDemandRecord = async (schoolId, userId, actualExpense, remarkId) => {
  const currentYear = new Date().getFullYear();
  const financialYear = `${currentYear}-${currentYear + 1}`;
  const demand_master_record = `${schoolId}|${financialYear}|${actualExpense}|Debit|${userId}`;

  await connection.query(`
    UPDATE tbl_demand_master 
    SET demand_master_record = ?
    WHERE demand_master_record LIKE ? AND status = 'Active'
  `, [demand_master_record, `%${remarkId}%`]);
};

// Get remarks for specific tharav
exports.getRemarksByNirnayId = async (req, res) => {
  try {
    const { nirnay_id } = req.query;

    if (!nirnay_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Nirnay ID is required' 
      });
    }

    // 1. Get the tharav record to extract exact tharavNo
    const [tharav] = await connection.query(
      `SELECT nirnay_reord FROM tbl_new_smc_nirnay WHERE nirnay_id = ?`,
      [nirnay_id]
    );

    if (!tharav.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Tharav not found' 
      });
    }

    // 2. Extract tharavNo (assuming format: "meetingNo|tharavNo|...")
    const tharavNo = tharav[0].nirnay_reord.split('|')[1].trim();

    // 3. Get remarks that exactly match this tharavNo
    const [remarks] = await connection.query(
      `SELECT * FROM tbl_new_smc_nirnay_remarks 
       WHERE nirnay_remarks_record LIKE ? 
       AND status = 'Active'`,
      [`${tharavNo}|%`] // Exact match at start of string
    );

    // 4. Parse the results
    const parsedRemarks = remarks.map(remark => {
      const parts = remark.nirnay_remarks_record.split('|');
      return {
        ...remark,
        parsedData: {
          tharavNo: parts[0],
          meetingNumber: parts[1],
          schoolId: parts[2],
          userId: parts[3],
          remarkText: parts[4],
          remarkPhoto: parts[5],
          actualExpense: parts[6],
          headId: parts[7],
          createdAt: parts[8],
          updatedAt: parts[9]
        }
      };
    });

    res.status(200).json({ 
      success: true,
      data: parsedRemarks 
    });

  } catch (error) {
    console.error("Error fetching remarks:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal Server Error" 
    });
  }
};

// Create new remark
exports.create = async (req, res) => {
  try {
    const { nirnay_id, remarkText, actualExpense, schoolId, userId, headId } = req.body;
    const remarkPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nirnay_id) {
      return res.status(400).json({ 
        success: false,
        message: "Nirnay ID is required" 
      });
    }

    // 1. Get tharav to extract tharavNo
    const [tharav] = await connection.query(
      `SELECT nirnay_reord FROM tbl_new_smc_nirnay WHERE nirnay_id = ?`,
      [nirnay_id]
    );

    const tharavNo = tharav[0].nirnay_reord.split('|')[1].trim();
    const meetingNumber = tharav[0].nirnay_reord.split('|')[0].trim();

    // 2. Create the remark record
    const nirnay_remarks_record = [
      tharavNo,
      meetingNumber,
      schoolId,
      userId,
      remarkText,
      remarkPhoto,
      actualExpense,
      headId,
      new Date().toISOString(),
      new Date().toISOString()
    ].join('|');

    // 3. Create demand record
    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    const demand_master_record = `${schoolId}|${financialYear}|${actualExpense}|Debit|${userId}`;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
      // 4. Insert remark
      const [remarkResult] = await conn.query(`
        INSERT INTO tbl_new_smc_nirnay_remarks 
        (nirnay_remarks_record, previous_date, disable_edit_delete, status, sync_date_time) 
        VALUES (?, ?, ?, "Active", ?)
      `, [
        nirnay_remarks_record,
        new Date(),
        0,
        new Date()
      ]);

      // 5. Insert demand record
      await conn.query(`
        INSERT INTO tbl_demand_master 
        (demand_master_record, demand_status, demanded, status, ins_date_time, update_date_time_record) 
        VALUES (?, "Pending", 1, "Active", ?, ?)
      `, [
        demand_master_record,
        new Date(),
        new Date()
      ]);

      await conn.commit();
      
      res.status(201).json({ 
        success: true,
        remarkId: remarkResult.insertId
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error creating remark:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};
// Update remark
exports.updateRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarkText, actualExpense, schoolId, userId } = req.body;
    const remarkPhoto = req.file ? req.file.path : null;

    const [existingRemark] = await connection.query(
      "SELECT * FROM tbl_new_smc_nirnay_remarks WHERE nirnay_remarks_id = ?",
      [id]
    );

    if (!existingRemark || existingRemark.length === 0) {
      return res.status(404).json({ success: false, message: "Remark not found" });
    }

    const parts = existingRemark[0].nirnay_remarks_record.split("|");
    const updatedRecord = [
      parts[0], // tharavNo
      parts[1], // meetingNumber
      parts[2], // schoolId
      parts[3], // userId
      remarkText || parts[4], // remarkText
      remarkPhoto || parts[5], // remarkPhoto
      actualExpense || parts[6], // actualExpense
      parts[7], // headId
      parts[8], // createdAt
      new Date().toISOString() // updatedAt
    ].join("|");

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
      await conn.query(
        "UPDATE tbl_new_smc_nirnay_remarks SET nirnay_remarks_record = ?, previous_date = ? WHERE nirnay_remarks_id = ?",
        [updatedRecord, new Date(), id]
      );

      await updateDemandRecord(schoolId, userId, actualExpense, id);

      await conn.commit();
      
      res.status(200).json({ 
        success: true,
        message: "Remark updated successfully"
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error updating remark:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};

// Delete remark
exports.deleteRemark = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingRemark] = await connection.query(
      "SELECT * FROM tbl_new_smc_nirnay_remarks WHERE nirnay_remarks_id = ?",
      [id]
    );

    if (!existingRemark || existingRemark.length === 0) {
      return res.status(404).json({ success: false, message: "Remark not found" });
    }

    const parts = existingRemark[0].nirnay_remarks_record.split("|");
    const schoolId = parts[2];
    const actualExpense = parts[6];

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
      await conn.query(
        "UPDATE tbl_new_smc_nirnay_remarks SET status = 'Inactive' WHERE nirnay_remarks_id = ?",
        [id]
      );

      await conn.query(
        "UPDATE tbl_demand_master SET status = 'Inactive' WHERE demand_master_record LIKE ?",
        [`%${schoolId}|%${actualExpense}%`]
      );

      await conn.commit();
      
      res.status(200).json({ 
        success: true,
        message: "Remark deleted successfully"
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error deleting remark:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};