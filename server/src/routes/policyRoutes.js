const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticate, policyController.getPolicies);
router.post('/', authenticate, authorizeRoles('admin'), policyController.createPolicy);
router.patch('/:id', authenticate, authorizeRoles('admin'), policyController.updatePolicy);
router.get('/compliance/:contractId', authenticate, policyController.checkPolicyCompliance);

module.exports = router;
