const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authenticate, upload.single('document'), contractController.uploadContract);
router.post('/:id/version', authenticate, upload.single('document'), contractController.uploadNewVersion);
router.get('/', authenticate, contractController.getContracts);
router.get('/:id', authenticate, contractController.getContractById);
router.patch('/:id', authenticate, contractController.updateContract);
router.delete('/:id', authenticate, authorizeRoles('admin', 'lawyer'), contractController.archiveContract);
router.get('/:id/download', authenticate, contractController.downloadContract);

module.exports = router;
