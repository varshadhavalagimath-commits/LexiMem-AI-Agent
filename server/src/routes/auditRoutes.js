const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticate, authorizeRoles('admin', 'lawyer'), auditController.getAuditLogs);

module.exports = router;
