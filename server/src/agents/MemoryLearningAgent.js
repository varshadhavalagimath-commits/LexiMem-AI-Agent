const Precedent = require('../models/Precedent');
const hindsightClient = require('../integrations/hindsightClient');

class MemoryLearningAgent {
  /**
   * Commits a confirmed, human-lawyer-approved legal decision into organizational memory.
   * NEVER commits raw unverified AI output as an approved precedent.
   */
  async commitDecision({
    organizationId,
    contractId,
    contractTitle,
    contractType,
    clauseCategory,
    originalClause,
    proposedClause,
    finalApprovedClause,
    decision, // 'approved' | 'rejected' | 'modified' | 'superseded'
    reason,
    jurisdiction = 'Delaware, USA',
    approvedBy, // User Object or ID
    isHumanVerified = true,
  }) {
    if (!isHumanVerified) {
      throw new Error('Safety Constraint: Unverified AI outputs cannot be committed as legal precedents. Qualified lawyer approval is required.');
    }

    if (!finalApprovedClause || !clauseCategory || !decision || !reason) {
      throw new Error('Incomplete precedent metadata: Category, finalApprovedClause, decision, and rationale are required.');
    }

    // 1. Prepare structured memory record
    const memoryRecord = {
      category: clauseCategory,
      contractType,
      jurisdiction,
      decision,
      reason,
      approvedWording: finalApprovedClause,
      originalCounterpartyWording: originalClause,
      timestamp: new Date().toISOString(),
      approverId: String(approvedBy?._id || approvedBy),
    };

    // 2. Retain into Hindsight Persistent Memory Bank
    let hindsightResult = null;
    try {
      hindsightResult = await hindsightClient.retain({
        bankId: `leximem-${String(organizationId)}`,
        content: `LEGAL PRECEDENT DECISION [${decision.toUpperCase()}]: Category: ${clauseCategory}. Approved Language: "${finalApprovedClause}". Reason: "${reason}". Original: "${originalClause}". Contract: ${contractTitle} (${contractType}, ${jurisdiction}).`,
        metadata: memoryRecord,
      });
    } catch (err) {
      console.warn('[MemoryLearningAgent] Hindsight retain fallback:', err.message);
    }

    // 3. Persist into Synchronized MongoDB Collection
    const precedent = await Precedent.create({
      organizationId,
      contractId,
      contractTitle,
      contractType,
      clauseCategory,
      originalClause,
      proposedClause: proposedClause || finalApprovedClause,
      finalApprovedClause,
      decision,
      reason,
      jurisdiction,
      approvedBy: approvedBy?._id || approvedBy,
      approvalDate: new Date(),
      status: 'active',
      hindsightMemoryReference: {
        bankId: `leximem-${String(organizationId)}`,
        memoryId: hindsightResult?.memoryId || `hs-${Date.now()}`,
        retainedAt: new Date(),
        status: hindsightResult?.mode === 'hindsight_live' ? 'synced' : 'local_backup',
      },
    });

    return {
      success: true,
      precedent,
      hindsightSynced: hindsightResult?.mode === 'hindsight_live',
      memoryId: precedent.hindsightMemoryReference.memoryId,
    };
  }

  /**
   * Marks a precedent as superseded when an updated standard is adopted.
   */
  async supersedePrecedent({ precedentId, newPrecedentId, reason, userId }) {
    const oldPrecedent = await Precedent.findById(precedentId);
    if (!oldPrecedent) throw new Error('Precedent not found.');

    oldPrecedent.status = 'superseded';
    if (newPrecedentId) {
      oldPrecedent.supersededBy = newPrecedentId;
    }
    await oldPrecedent.save();

    return {
      success: true,
      message: 'Historical precedent marked as superseded.',
      oldPrecedent,
    };
  }
}

module.exports = new MemoryLearningAgent();
