const db = require("../Config/Connection");

module.exports = {
  checkTharavStatus: async (req, res) => {
    try {
      const { nirnay_id } = req.params;

      const [tharav] = await db.query(
        `SELECT completed_remarks, complete_tharav_img, complete_date, work_status 
         FROM tbl_new_smc_nirnay 
         WHERE nirnay_id = ?`, 
        [nirnay_id]
      );

      if (!tharav) {
        return res.status(404).json({ message: 'Tharav not found' });
      }

      const isCompleted = tharav.work_status === 'Completed' && 
                         tharav.completed_remarks !== null &&
                         tharav.completed_remarks !== '';

      res.json({
        isCompleted,
        completedData: {
          completed_remarks: tharav.completed_remarks,
          complete_tharav_img: tharav.complete_tharav_img,
          complete_date: tharav.complete_date
        }
      });
    } catch (error) {
      console.error('Error checking tharav status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  completeTharav: async (req, res) => {
    try {
      const { nirnay_id, completed_remarks, schoolId, userId } = req.body;
      
      if (!nirnay_id || !completed_remarks) {
        return res.status(400).json({ 
          success: false,
          message: 'nirnay_id and completed_remarks are required'
        });
      }

      const complete_tharav_img = req.file ? 
        `/uploads/tharav_completion/${req.file.filename}` : null;

      const [result] = await db.query(
        `UPDATE tbl_new_smc_nirnay 
         SET 
           completed_remarks = ?,
           complete_tharav_img = ?,
           complete_date = NOW(),
           work_status = 'Completed',
           status = 1
         WHERE nirnay_id = ?`,
        [completed_remarks, complete_tharav_img, nirnay_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Tharav not found'
        });
      }

      // Fetch the updated record to return complete data
      const [completedTharav] = await db.query(
        `SELECT completed_remarks, complete_tharav_img, complete_date
         FROM tbl_new_smc_nirnay
         WHERE nirnay_id = ?`,
        [nirnay_id]
      );

      res.json({ 
        success: true,
        message: 'Tharav marked as completed',
        completedData: completedTharav
      });
    } catch (error) {
      console.error('Error completing tharav:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error'
      });
    }
  }
};