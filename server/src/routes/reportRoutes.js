const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.get('/overview', authenticate, reportController.getOverview);
router.get('/risks', authenticate, reportController.getRiskReport);
router.get('/renewals', authenticate, reportController.getRenewalReport);
router.get('/export-csv', authenticate, reportController.exportCsv);

module.exports = router;
