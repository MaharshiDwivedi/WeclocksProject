const Report = require('../models/reportModel');

exports.generateReport = async (req, res) => {
  try {
    const { fund_report_record } = req.body;

    // Check if record exists
    const existingRecord = await Report.findByRecord(fund_report_record);
    if (existingRecord) {
      return res.json({ 
        message: 'Report already exists',
        data: existingRecord
      });
    }

    // Create new record
    const result = await Report.create(fund_report_record);
    
    res.json({
      message: 'Report created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};