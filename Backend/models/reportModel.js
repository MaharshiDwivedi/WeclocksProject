const connection = require('../Config/Connection');

const Report = {
  async create(fundReportRecord) {
    try {
      const [result] = await connection.execute(
        'INSERT INTO tbl_fund_report (fund_report_record, status, ins_date_time) VALUES (?, ?, NOW())',
        [fundReportRecord, 'Active']
      );
      return result;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;  // Re-throw for proper handling in controller
    }
  },

  async findByRecord(fundReportRecord) {
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tbl_fund_report WHERE fund_report_record = ?',
        [fundReportRecord]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding report:', error);
      throw error;  // Re-throw for proper handling
    }
  }
};

module.exports = Report;
