const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { authenticate } = require('../middleware/auth');

router.post('/:contractId', authenticate, analysisController.triggerAnalysis);
router.get('/:contractId', authenticate, analysisController.getContractAnalysis);
router.get('/:contractId/risks', authenticate, analysisController.getRisks);

module.exports = router;
