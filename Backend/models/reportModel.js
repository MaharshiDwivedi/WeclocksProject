const connection = require('../Config/Connection');

const Report = {
  async create(fundReportRecord) {
    const [result] = await connection.execute(
      'INSERT INTO tbl_fund_report (fund_report_record, status, ins_date_time) VALUES (?, ?, NOW())',
      [fundReportRecord, 'Active']
    );
    return result;
  },

  async findByRecord(fundReportRecord) {
    const [rows] = await connection.execute(
      'SELECT * FROM tbl_fund_report WHERE fund_report_record = ?',
      [fundReportRecord]
    );
    return rows[0];
  }
};

module.exports = Report;