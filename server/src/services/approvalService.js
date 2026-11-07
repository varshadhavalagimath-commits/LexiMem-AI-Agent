const Contract = require('../models/Contract');
const Approval = require('../models/Approval');
const workflowAgent = require('../agents/WorkflowAgent');
const { logAudit } = require('../middleware/auditLogger');

class ApprovalService {
  async getApprovals(organizationId, filter = {}) {
    const contracts = await Contract.find({
      organizationId,
      status: { $in: ['Under Review', 'Pending Approval', 'Changes Requested'] },
    })
      .populate('owner', 'name email role')
      .populate('assignedReviewer', 'name email role')
      .sort({ updatedAt: -1 });

    const recentDecisions = await Approval.find()
      .populate('contractId', 'title contractType status')
      .populate('reviewerId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(10);

    return {
      pendingContracts: contracts,
      recentDecisions,
    };
  }

  async submitDecision(contractId, { decision, comments = '', stage = 'legal_review' }, user) {
    const contract = await Contract.findById(contractId);
    if (!contract) throw new Error('Contract not found.');

    let newStatus = contract.status;
    if (decision === 'approved') {
      newStatus = 'Approved';
    } else if (decision === 'rejected') {
      newStatus = 'Terminated';
    } else if (decision === 'changes_requested') {
      newStatus = 'Changes Requested';
    }

    // Role verification
    const validation = workflowAgent.validateStatusTransition(contract.status, newStatus, user.role);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    // Create Approval record
    const approval = await Approval.create({
      contractId: contract._id,
      reviewerId: user._id,
      decision,
      comments,
      stage,
      timestamp: new Date(),
    });

    contract.status = newStatus;
    await contract.save();

    await logAudit({ user, organizationId: user.organizationId }, {
      action: `CONTRACT_${decision.toUpperCase()}`,
      resourceType: 'contract',
      resourceId: contract._id,
      resourceTitle: contract.title,
      details: { decision, comments, newStatus },
    });

    return {
      approval,
      contract,
    };
  }
}

module.exports = new ApprovalService();
