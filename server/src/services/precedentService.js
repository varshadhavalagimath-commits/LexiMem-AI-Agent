const Precedent = require('../models/Precedent');
const Clause = require('../models/Clause');
const RiskFinding = require('../models/RiskFinding');
const memoryLearningAgent = require('../agents/MemoryLearningAgent');
const precedentRetrievalAgent = require('../agents/PrecedentRetrievalAgent');
const hindsightClient = require('../integrations/hindsightClient');
const { logAudit } = require('../middleware/auditLogger');

class PrecedentService {
  async commitApprovedPrecedent(payload, user) {
    const {
      contractId,
      contractTitle,
      contractType,
      clauseCategory,
      originalClause,
      proposedClause,
      finalApprovedClause,
      decision, // 'approved', 'rejected', 'modified'
      reason,
      jurisdiction,
      clauseId,
    } = payload;

    // Save to Persistent Memory via Memory Learning Agent
    const result = await memoryLearningAgent.commitDecision({
      organizationId: user.organizationId,
      contractId,
      contractTitle,
      contractType,
      clauseCategory,
      originalClause,
      proposedClause,
      finalApprovedClause,
      decision,
      reason,
      jurisdiction,
      approvedBy: user,
      isHumanVerified: true,
    });

    // Update corresponding Clause and RiskFinding status in MongoDB
    if (clauseId) {
      await Clause.findByIdAndUpdate(clauseId, {
        status: decision === 'approved' ? 'accepted' : 'rejected',
        matchedPrecedentId: result.precedent._id,
      });

      // Mark related risk as mitigated
      await RiskFinding.updateMany(
        { clauseId },
        { status: 'mitigated' }
      );
    }

    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'PRECEDENT_MEMORY_COMMITTED',
      resourceType: 'precedent',
      resourceId: result.precedent._id,
      resourceTitle: `${clauseCategory} - ${decision.toUpperCase()}`,
      details: {
        decision,
        reason,
        hindsightSynced: result.hindsightSynced,
        memoryId: result.memoryId,
      },
    });

    return result;
  }

  async searchPrecedents({ query, category, decision, jurisdiction }, organizationId) {
    const filter = { organizationId };

    if (category && category !== 'All') {
      filter.clauseCategory = category;
    }

    if (decision && decision !== 'All') {
      filter.decision = decision;
    }

    if (jurisdiction && jurisdiction !== 'All') {
      filter.jurisdiction = { $regex: jurisdiction, $options: 'i' };
    }

    if (query) {
      filter.$or = [
        { finalApprovedClause: { $regex: query, $options: 'i' } },
        { originalClause: { $regex: query, $options: 'i' } },
        { reason: { $regex: query, $options: 'i' } },
        { contractTitle: { $regex: query, $options: 'i' } },
      ];
    }

    const precedents = await Precedent.find(filter)
      .populate('approvedBy', 'name email role')
      .populate('contractId', 'title contractType')
      .sort({ approvalDate: -1 });

    return precedents;
  }

  async recallForClause(clauseText, category, contractType, jurisdiction, organizationId) {
    return precedentRetrievalAgent.retrievePrecedents({
      clauseText,
      category,
      contractType,
      jurisdiction,
      organizationId,
    });
  }

  async recordFeedback(precedentId, reaction, comment, user) {
    const precedent = await Precedent.findOne({ _id: precedentId, organizationId: user.organizationId });
    if (!precedent) throw new Error('Precedent not found.');

    precedent.userFeedback.push({
      userId: user._id,
      reaction,
      comment,
      date: new Date(),
    });

    if (reaction === 'useful') {
      precedent.relevanceCount += 1;
    }

    await precedent.save();

    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'PRECEDENT_FEEDBACK_RECORDED',
      resourceType: 'precedent',
      resourceId: precedent._id,
      resourceTitle: precedent.clauseCategory,
      details: { reaction, comment },
    });

    return precedent;
  }

  async supersedePrecedent(precedentId, reason, user, newPrecedentId = null) {
    const res = await memoryLearningAgent.supersedePrecedent({
      precedentId,
      newPrecedentId,
      reason,
      userId: user._id,
    });

    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'PRECEDENT_SUPERSEDED',
      resourceType: 'precedent',
      resourceId: precedentId,
      resourceTitle: 'Precedent marked superseded',
      details: { reason },
    });

    return res;
  }

  async getMemoryDashboardStats(organizationId) {
    const totalPrecedents = await Precedent.countDocuments({ organizationId });
    const approvedCount = await Precedent.countDocuments({ organizationId, decision: 'approved' });
    const rejectedCount = await Precedent.countDocuments({ organizationId, decision: 'rejected' });
    const modifiedCount = await Precedent.countDocuments({ organizationId, decision: 'modified' });
    const supersededCount = await Precedent.countDocuments({ organizationId, status: 'superseded' });

    const recentUpdates = await Precedent.find({ organizationId })
      .populate('approvedBy', 'name email role')
      .sort({ approvalDate: -1 })
      .limit(6);

    const hindsightHealth = await hindsightClient.healthCheck();

    return {
      totalPrecedents,
      decisions: {
        approved: approvedCount,
        rejected: rejectedCount,
        modified: modifiedCount,
        superseded: supersededCount,
      },
      hindsightHealth,
      recentUpdates,
    };
  }
}

module.exports = new PrecedentService();
