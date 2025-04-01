const express = require('express');
const router = express.Router();
const compTharavController = require('../controllers/compTharavController');
const { tharavCompletionMiddleware } = require('../middleware/upload'); // Note the changed import name

router.post('/complete', tharavCompletionMiddleware, compTharavController.completeTharav);
router.get('/status/:nirnay_id', compTharavController.checkTharavStatus);

module.exports = router;