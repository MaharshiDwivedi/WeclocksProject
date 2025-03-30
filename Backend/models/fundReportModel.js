const mysql = require('mysql2/promise');
const connection = require('../Config/Connection');

// Get fund reports by year
exports.getFundReportsByYear = async (year) => {
  const conn = await mysql.createConnection(connection);
  
  try {
    const [rows] = await conn.execute(
      'SELECT s.school_name, s.school_id, fr.* FROM tbl_fund_report fr ' +
      'JOIN tbl_school s ON fr.school_id = s.school_id ' +
      'WHERE fr.financial_year = ? AND fr.status = "Active"',
      [year]
    );
    
    return rows;
  } finally {
    await conn.end();
  }
};

// Get all active schools
exports.getAllActiveSchools = async () => {
  const conn = await mysql.createConnection(connection);
  
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM tbl_school WHERE status = "Active"'
    );
    
    return rows;
  } finally {
    await conn.end();
  }
};

// Create a new fund report
exports.createFundReport = async (fund_report_record) => {
  const conn = await mysql.createConnection(connection);
  
  try {
    // Check if the record already exists
    const [existingRecords] = await conn.execute(
      'SELECT * FROM tbl_fund_report WHERE school_id = ? AND financial_year = ? AND status = "Active"',
      [fund_report_record.school_id, fund_report_record.financial_year]
    );
    
    if (existingRecords.length > 0) {
      throw new Error('DUPLICATE');
    }
    
    // Insert the new record
    const now = new Date();
    const [result] = await conn.execute(
      'INSERT INTO tbl_fund_report (school_id, financial_year, report_data, status, ins_date_time) VALUES (?, ?, ?, "Active", ?)',
      [fund_report_record.school_id, fund_report_record.financial_year, JSON.stringify(fund_report_record.report_data), now]
    );
    
    return { 
      message: 'Report record created successfully',
      id: result.insertId
    };
  } finally {
    await conn.end();
  }
};

// Get expense data by school and year
exports.getExpenseDataBySchoolAndYear = async (financialYear, school_id) => {
  const conn = await mysql.createConnection(connection);
  
  try {
    // Parse the financial year (e.g., "2023-2024" -> "2023")
    const year = financialYear.split('-')[0];
    
    // Query to fetch from SMC decision remarks table
    const [rows] = await conn.execute(
      `SELECT 
        remark_id,
        remark_data
      FROM tbl_smc_remarks 
      WHERE school_id = ? 
      AND ins_date_time LIKE CONCAT(?, '%')
      AND status = "Active"`,
      [school_id, year]
    );
    
    // Process the data to extract head_id and actual_cost
    const processedData = [];
    for (const row of rows) {
      // Split the remark_data by '|'
      const parts = row.remark_data.split('|');
      
      // Check if we have enough parts
      if (parts.length >= 7) {
        const actualCost = parseFloat(parts[5]); // 6th position (index 5)
        const headId = parseInt(parts[6], 10);   // 7th position (index 6)
        
        if (!isNaN(headId) && !isNaN(actualCost)) {
          // Check if this head_id already exists
          const existingIndex = processedData.findIndex(item => item.head_id === headId);
          
          if (existingIndex !== -1) {
            // Sum up if the head_id already exists
            processedData[existingIndex].actual_cost += actualCost;
          } else {
            // Add new entry if it doesn't exist
            processedData.push({
              head_id: headId,
              actual_cost: actualCost
            });
          }
        }
      }
    }
    
    return processedData;
  } finally {
    await conn.end();
  }
};  