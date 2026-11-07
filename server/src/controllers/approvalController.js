const approvalService = require('../services/approvalService');

exports.getApprovals = async (req, res, next) => {
  try {
    const data = await approvalService.getApprovals(req.organizationId);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const result = await approvalService.submitDecision(id, { decision: 'approved', comments }, req.user);
    res.json({
      success: true,
      message: 'Contract approved successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const result = await approvalService.submitDecision(id, { decision: 'rejected', comments }, req.user);
    res.json({
      success: true,
      message: 'Contract rejected and marked terminated.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.requestChanges = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const result = await approvalService.submitDecision(id, { decision: 'changes_requested', comments }, req.user);
    res.json({
      success: true,
      message: 'Modifications requested on contract.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
