const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticate, approvalController.getApprovals);
router.post('/:id/approve', authenticate, authorizeRoles('admin', 'lawyer'), approvalController.approveContract);
router.post('/:id/reject', authenticate, authorizeRoles('admin', 'lawyer'), approvalController.rejectContract);
router.post('/:id/request-changes', authenticate, authorizeRoles('admin', 'lawyer'), approvalController.requestChanges);

module.exports = router;
