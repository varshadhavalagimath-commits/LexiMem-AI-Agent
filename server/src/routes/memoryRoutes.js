const express = require('express');
const router = express.Router();
const precedentController = require('../controllers/precedentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/dashboard', authenticate, precedentController.getMemoryDashboard);
router.post('/recall', authenticate, precedentController.recallForClause);
router.post('/store', authenticate, authorizeRoles('admin', 'lawyer'), precedentController.commitPrecedent);
router.get('/history', authenticate, precedentController.getPrecedents);

module.exports = router;
