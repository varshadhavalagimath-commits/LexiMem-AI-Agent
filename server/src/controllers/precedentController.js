const precedentService = require('../services/precedentService');

exports.commitPrecedent = async (req, res, next) => {
  try {
    const result = await precedentService.commitApprovedPrecedent(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Approved legal decision successfully saved to Precedent Memory Engine.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPrecedents = async (req, res, next) => {
  try {
    const precedents = await precedentService.searchPrecedents(req.query, req.organizationId);
    res.json({
      success: true,
      data: precedents,
    });
  } catch (err) {
    next(err);
  }
};

exports.searchPrecedents = async (req, res, next) => {
  try {
    const precedents = await precedentService.searchPrecedents(req.body, req.organizationId);
    res.json({
      success: true,
      data: precedents,
    });
  } catch (err) {
    next(err);
  }
};

exports.recallForClause = async (req, res, next) => {
  try {
    const { clauseText, category, contractType, jurisdiction } = req.body;
    const result = await precedentService.recallForClause(
      clauseText,
      category,
      contractType,
      jurisdiction,
      req.organizationId
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.recordFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reaction, comment } = req.body;
    const updated = await precedentService.recordFeedback(id, reaction, comment, req.user);
    res.json({
      success: true,
      message: 'Precedent recommendation feedback recorded.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.supersedePrecedent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, newPrecedentId } = req.body;
    const result = await precedentService.supersedePrecedent(id, reason, req.user, newPrecedentId);
    res.json({
      success: true,
      message: 'Precedent marked superseded.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMemoryDashboard = async (req, res, next) => {
  try {
    const stats = await precedentService.getMemoryDashboardStats(req.organizationId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};
