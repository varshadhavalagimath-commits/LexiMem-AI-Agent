const express = require('express');
const router = express.Router();
const obligationController = require('../controllers/obligationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, obligationController.getObligations);
router.post('/', authenticate, obligationController.createObligation);
router.patch('/:id', authenticate, obligationController.updateObligation);
router.get('/renewals', authenticate, obligationController.getRenewalAlerts);

module.exports = router;
