const mysql = require('mysql2/promise');
const connection = require('../Config/Connection');
const fundReportModel = require('../models/fundReportModel');

// Existing controller functions
exports.getFundReports = async (req, res) => {
  const { year } = req.query;
  
  if (!year) {
    return res.status(400).json({ error: 'Financial year is required' });
  }
  
  try {
    const reports = await fundReportModel.getFundReportsByYear(year);
    return res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching fund reports:', error);
    return res.status(500).json({ error: 'Failed to fetch fund reports' });
  }
};

exports.getAllSchools = async (req, res) => {
  try {
    const schools = await fundReportModel.getAllActiveSchools();
    return res.status(200).json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ error: 'Failed to fetch schools' });
  }
};

exports.createFundReport = async (req, res) => {
  const { fund_report_record } = req.body;
  
  if (!fund_report_record) {
    return res.status(400).json({ error: 'Fund report record is required' });
  }
  
  try {
    const result = await fundReportModel.createFundReport(fund_report_record);
    return res.status(201).json(result);
  } catch (error) {
    if (error.message === 'DUPLICATE') {
      return res.status(409).json({ error: 'Report already exists for this financial year' });
    }
    console.error('Error saving fund report:', error);
    return res.status(500).json({ error: 'Failed to save fund report' });
  }
};

// New controller function for yearly expense data
exports.getYearlyExpenseData = async (req, res) => {
  const { financialYear, school_id } = req.body;
  
  if (!financialYear || !school_id) {
    return res.status(400).json({ error: 'Financial year and school ID are required' });
  }
  
  try {
    const expenseData = await fundReportModel.getExpenseDataBySchoolAndYear(financialYear, school_id);
    return res.status(200).json({ data: expenseData });
  } catch (error) {
    console.error('Error fetching expense data:', error);
    return res.status(500).json({ error: 'Failed to fetch expense data' });
  }
};