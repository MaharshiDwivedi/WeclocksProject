const express = require('express');
const router = express.Router();
const fundReportController = require('../controllers/fundReportController');

// Existing routes
router.get('/fundreports', fundReportController.getFundReports);
router.get('/all-schools', fundReportController.getAllSchools);

// New route for yearly expense data


module.exports = router;