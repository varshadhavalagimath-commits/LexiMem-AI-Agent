const negotiationService = require('../services/negotiationService');
const Negotiation = require('../models/Negotiation');

exports.getNegotiationForClause = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { clauseId } = req.query;
    if (!clauseId) {
      // Return all negotiations for this contract
      const negs = await Negotiation.find({ contractId }).populate('updatedBy', 'name email');
      return res.json({ success: true, data: negs });
    }

    const negotiation = await negotiationService.getOrCreateNegotiation(contractId, clauseId, req.user);
    res.json({
      success: true,
      data: negotiation,
    });
  } catch (err) {
    next(err);
  }
};

exports.regenerateSuggestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await negotiationService.regenerateSuggestion(id, req.user);
    res.json({
      success: true,
      message: 'New negotiation proposal generated.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.addCounterproposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { wording, notes } = req.body;
    const updated = await negotiationService.addCounterproposal(id, { wording, notes }, req.user);
    res.json({
      success: true,
      message: 'Counterproposal drafted.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.finalizeDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, finalApprovedClause, reason } = req.body;
    const result = await negotiationService.finalizeDecision(id, { decision, finalApprovedClause, reason }, req.user);
    res.json({
      success: true,
      message: `Negotiation ${decision}. Precedent memory updated.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
