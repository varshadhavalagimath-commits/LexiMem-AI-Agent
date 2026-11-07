const Negotiation = require('../models/Negotiation');
const Clause = require('../models/Clause');
const Contract = require('../models/Contract');
const negotiationAgent = require('../agents/NegotiationAgent');
const precedentService = require('./precedentService');
const { logAudit } = require('../middleware/auditLogger');

class NegotiationService {
  async getOrCreateNegotiation(contractId, clauseId, user) {
    let negotiation = await Negotiation.findOne({ contractId, clauseId });

    if (!negotiation) {
      const clause = await Clause.findById(clauseId);
      if (!clause) throw new Error('Clause not found.');

      const contract = await Contract.findById(contractId);

      // Generate initial AI suggestion & recall precedents
      const aiResponse = await negotiationAgent.generateAlternatives({
        clauseCategory: clause.category,
        originalClause: clause.text,
        contractType: contract?.contractType,
        jurisdiction: contract?.jurisdiction,
        organizationId: user.organizationId,
      });

      negotiation = await Negotiation.create({
        contractId,
        clauseId,
        clauseCategory: clause.category,
        originalClause: clause.text,
        aiSuggestion: aiResponse.aiSuggestion,
        approvedPrecedentText: aiResponse.approvedPrecedentText,
        proposedClause: aiResponse.aiSuggestion,
        pros: aiResponse.pros,
        cons: aiResponse.cons,
        rationale: aiResponse.rationale,
        status: 'draft',
        updatedBy: user._id,
      });
    }

    return negotiation;
  }

  async regenerateSuggestion(negotiationId, user) {
    const neg = await Negotiation.findById(negotiationId);
    if (!neg) throw new Error('Negotiation not found.');

    const contract = await Contract.findById(neg.contractId);

    const aiResponse = await negotiationAgent.generateAlternatives({
      clauseCategory: neg.clauseCategory,
      originalClause: neg.originalClause,
      contractType: contract?.contractType,
      jurisdiction: contract?.jurisdiction,
      organizationId: user.organizationId,
    });

    neg.aiSuggestion = aiResponse.aiSuggestion;
    neg.proposedClause = aiResponse.aiSuggestion;
    neg.pros = aiResponse.pros;
    neg.cons = aiResponse.cons;
    neg.rationale = aiResponse.rationale;
    neg.approvedPrecedentText = aiResponse.approvedPrecedentText;
    neg.updatedBy = user._id;

    await neg.save();
    return neg;
  }

  async addCounterproposal(negotiationId, { wording, notes }, user) {
    const neg = await Negotiation.findById(negotiationId);
    if (!neg) throw new Error('Negotiation not found.');

    neg.proposedClause = wording;
    neg.counterproposals.push({
      proposer: user._id,
      wording,
      notes,
      createdAt: new Date(),
    });
    neg.status = 'counterproposal_sent';
    neg.updatedBy = user._id;

    await neg.save();

    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'COUNTERPROPOSAL_DRAFTED',
      resourceType: 'negotiation',
      resourceId: neg._id,
      resourceTitle: `${neg.clauseCategory} negotiation update`,
      details: { notes },
    });

    return neg;
  }

  async finalizeDecision(negotiationId, { decision, finalApprovedClause, reason }, user) {
    const neg = await Negotiation.findById(negotiationId);
    if (!neg) throw new Error('Negotiation not found.');

    const contract = await Contract.findById(neg.contractId);

    neg.status = decision === 'approved' ? 'accepted' : 'rejected';
    neg.proposedClause = finalApprovedClause || neg.proposedClause;
    neg.updatedBy = user._id;
    await neg.save();

    // If approved or modified, save to Precedent Memory!
    let precedentRecord = null;
    if (decision === 'approved' || decision === 'modified') {
      precedentRecord = await precedentService.commitApprovedPrecedent({
        contractId: neg.contractId,
        contractTitle: contract?.title,
        contractType: contract?.contractType || 'Service Agreement',
        clauseCategory: neg.clauseCategory,
        originalClause: neg.originalClause,
        proposedClause: neg.proposedClause,
        finalApprovedClause: finalApprovedClause || neg.proposedClause,
        decision,
        reason: reason || 'Approved negotiated counterproposal during lawyer contract review.',
        jurisdiction: contract?.jurisdiction,
        clauseId: neg.clauseId,
      }, user);
    }

    return {
      negotiation: neg,
      precedent: precedentRecord,
    };
  }
}

module.exports = new NegotiationService();
