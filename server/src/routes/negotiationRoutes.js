const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/:contractId', authenticate, negotiationController.getNegotiationForClause);
router.post('/:id/suggest', authenticate, negotiationController.regenerateSuggestion);
router.post('/:id/counterproposal', authenticate, negotiationController.addCounterproposal);
router.post('/:id/finalize', authenticate, authorizeRoles('admin', 'lawyer'), negotiationController.finalizeDecision);

module.exports = router;
