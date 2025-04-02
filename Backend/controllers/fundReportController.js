const fundReportModel = require('../models/fundReportModel');

// Get fund reports by financial year
exports.getFundReports = async (req, res) => {
  try {
    const { year } = req.body;
    console.log('Request body:', req.body);
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Financial year is required as query parameter'
      });
    }

    const reports = await fundReportModel.getFundReportsByYear(year);
    return res.status(200).json({
      success: true,
      data: reports,
      message: 'Fund reports fetched successfully'
    });

  } catch (error) {
    console.error('Error in getFundReports:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch fund reports'
    });
  }
};

// Get all active schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await fundReportModel.getAllActiveSchools();
    return res.status(200).json({
      success: true,
      data: schools,
      message: 'Active schools fetched successfully'
    });

  } catch (error) {
    console.error('Error in getAllSchools:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active schools'
    });
  }
};


