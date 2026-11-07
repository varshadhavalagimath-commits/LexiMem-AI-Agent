const obligationService = require('../services/obligationService');
const Obligation = require('../models/Obligation');

exports.getObligations = async (req, res, next) => {
  try {
    const data = await obligationService.getObligations(req.organizationId, req.query);
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

exports.createObligation = async (req, res, next) => {
  try {
    const { contractId, description, category, dueDate, priority, assignedTo } = req.body;
    const ob = await Obligation.create({
      contractId,
      description,
      category,
      dueDate: new Date(dueDate),
      priority,
      assignedTo: assignedTo || req.user._id,
      assignedName: req.user.name,
      status: 'pending',
    });
    res.status(201).json({
      success: true,
      message: 'Obligation created.',
      data: ob,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateObligation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await obligationService.updateObligation(id, req.body, req.user);
    res.json({
      success: true,
      message: 'Obligation updated.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRenewalAlerts = async (req, res, next) => {
  try {
    const alerts = await obligationService.getRenewalAlerts(req.organizationId);
    res.json({
      success: true,
      data: alerts,
    });
  } catch (err) {
    next(err);
  }
};
