const express = require('express');
const router = express.Router();
const fundReportController = require('../controllers/fundReportController');

// Routes
router.post('/fundreports', fundReportController.getFundReports);
router.get('/all-schools', fundReportController.getAllSchools);

module.exports = router;