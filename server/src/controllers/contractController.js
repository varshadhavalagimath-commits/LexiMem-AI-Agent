const path = require('path');
const fs = require('fs');
const contractService = require('../services/contractService');
const Contract = require('../models/Contract');
const { logAudit } = require('../middleware/auditLogger');

exports.uploadContract = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX contract file.' });
    }

    const result = await contractService.uploadAndProcessContract(req.file, req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Contract uploaded and analyzed successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadNewVersion = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload the revised PDF or DOCX file.' });
    }

    const { id } = req.params;
    const { changeSummary } = req.body;
    const versionRecord = await contractService.uploadNewVersion(id, req.file, req.user, changeSummary);

    res.status(201).json({
      success: true,
      message: `New version (v${versionRecord.versionNumber}) uploaded and compared successfully.`,
      data: versionRecord,
    });
  } catch (err) {
    next(err);
  }
};

exports.getContracts = async (req, res, next) => {
  try {
    const result = await contractService.getContracts(req.query, req.organizationId);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getContractById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await contractService.getContractDetails(id, req.organizationId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await contractService.updateContract(id, req.body, req.user);
    res.json({
      success: true,
      message: 'Contract updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.downloadContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findOne({ _id: id, organizationId: req.organizationId });
    if (!contract || !contract.originalFile?.filePath) {
      return res.status(404).json({ success: false, message: 'Contract file reference not found.' });
    }

    const filePath = path.resolve(contract.originalFile.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Physical contract file not found on disk.' });
    }

    await logAudit(req, {
      action: 'CONTRACT_FILE_DOWNLOADED',
      resourceType: 'contract',
      resourceId: contract._id,
      resourceTitle: contract.title,
    });

    res.download(filePath, contract.originalFile.originalName);
  } catch (err) {
    next(err);
  }
};

exports.archiveContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findOne({ _id: id, organizationId: req.organizationId });
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    contract.status = 'Archived';
    await contract.save();

    await logAudit(req, {
      action: 'CONTRACT_ARCHIVED',
      resourceType: 'contract',
      resourceId: contract._id,
      resourceTitle: contract.title,
    });

    res.json({ success: true, message: 'Contract archived successfully.', data: contract });
  } catch (err) {
    next(err);
  }
};
