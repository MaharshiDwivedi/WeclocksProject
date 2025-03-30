const Report = require('../models/reportModel');

exports.generateReport = async (req, res) => {
  try {
    const { fund_report_record } = req.body;

    if (!fund_report_record) {
      return res.status(400).json({ error: 'fund_report_record is required' });
    }

    // Check if report already exists
    const existingRecord = await Report.findByRecord(fund_report_record);

    if (existingRecord) {
      return res.status(409).json({
        message: 'Report already exists for this financial year',
        data: existingRecord
      });
    }

    // Create new report record
    const result = await Report.create(fund_report_record);

    res.status(201).json({
      message: 'Report created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Database Error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Duplicate record: Report already exists'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }
};
