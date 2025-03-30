const express = require('express');
const router = express.Router();
const fundReportController = require('../controllers/fundReportController');

// Existing routes
router.get('/fundreports', fundReportController.getFundReports);
router.get('/all-schools', fundReportController.getAllSchools);
router.post('/report', fundReportController.createFundReport);

// New route for yearly expense data
router.post('/yearlyExpenseData', fundReportController.getYearlyExpenseData);

module.exports = router;