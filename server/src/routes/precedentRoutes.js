const express = require('express');
const router = express.Router();
const precedentController = require('../controllers/precedentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticate, authorizeRoles('admin', 'lawyer'), precedentController.commitPrecedent);
router.get('/', authenticate, precedentController.getPrecedents);
router.post('/search', authenticate, precedentController.searchPrecedents);
router.post('/recall', authenticate, precedentController.recallForClause);
router.post('/:id/feedback', authenticate, precedentController.recordFeedback);
router.post('/:id/supersede', authenticate, authorizeRoles('admin', 'lawyer'), precedentController.supersedePrecedent);
router.get('/dashboard', authenticate, precedentController.getMemoryDashboard);

module.exports = router;
