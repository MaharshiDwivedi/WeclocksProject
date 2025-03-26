const connection = require("../Config/Connection");

// Helper function to update demand record when remark is updated
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

// Create remark
exports.create = async (req, res) => {
  try {
    const { tharavNo, remarkDate, remarkText, actualExpense, meetingNumber, schoolId, userId, headId } = req.body;
    const remarkPhoto = req.file ? req.file.path : null;

    const nirnay_remarks_record = `${tharavNo}|${meetingNumber}|${schoolId}|${userId}|${remarkText}|${remarkPhoto}|${actualExpense}|${headId}|${new Date().toISOString()}|${new Date().toISOString()}`;
    
    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    const demand_master_record = `${schoolId}|${financialYear}|${actualExpense}|Debit|${userId}`;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
      const [remarkResult] = await conn.query(`
        INSERT INTO tbl_new_smc_nirnay_remarks 
        (nirnay_remarks_record, previous_date, disable_edit_delete, status, sync_date_time) 
        VALUES (?, ?, ?, "Active", ?)
      `, [
        nirnay_remarks_record,
        remarkDate || new Date(),
        0,
        new Date()
      ]);

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
    console.error("Error in create function:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};

// Get remarks by tharavNo
exports.getRemarksByTharavNo = async (req, res) => {
  try {
    const { tharavNo } = req.query;

    const [rows] = await connection.query(
      "SELECT * FROM tbl_new_smc_nirnay_remarks WHERE nirnay_remarks_record LIKE ? AND status='Active'",
      [`%${tharavNo}%`]
    );

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

      // Update corresponding demand record
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
      // Soft delete remark
      await conn.query(
        "UPDATE tbl_new_smc_nirnay_remarks SET status = 'Inactive' WHERE nirnay_remarks_id = ?",
        [id]
      );

      // Soft delete corresponding demand record
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