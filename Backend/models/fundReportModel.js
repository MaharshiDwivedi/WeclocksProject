const connection = require('../Config/Connection');

// Get fund reports by year
exports.getFundReportsByYear = async (year) => {
  try {
    const [rows] = await connection.query(
      "SELECT * FROM tbl_fund_report WHERE fund_report_record LIKE ? AND status = 'Active'",
      [`${year}|%`]
    );
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Error in getFundReportsByYear:', error);
    throw new Error(`Failed to fetch fund reports: ${error.message}`);
  }
};

// Get all active schools
exports.getAllActiveSchools = async () => {
  try {
    const [rows] = await connection.execute(
      'SELECT school_id, school_name FROM tbl_schools WHERE status = "Active"'
    );
    return rows || [];
  } catch (error) {
    console.error('Error in getAllActiveSchools:', error);
    throw new Error(`Failed to fetch active schools: ${error.message}`);
  }
};