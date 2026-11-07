const User = require('../models/User');

class WorkflowAgent {
  /**
   * Smart Approval Routing: Determines reviewer assignment based on risk and contract value.
   */
  async routeContract({ riskScore, contractType, contractValue = 0, organizationId }) {
    let requiredRole = 'business_user';
    let rationale = '';

    if (riskScore >= 60 || contractValue > 250000 || contractType === 'Vendor Agreement') {
      requiredRole = 'lawyer';
      rationale = `High risk score (${riskScore}/100) or high contract value ($${contractValue.toLocaleString()}) requires Senior Legal Counsel review.`;
    } else if (riskScore >= 40) {
      requiredRole = 'lawyer';
      rationale = `Moderate risk requires Legal Department sign-off.`;
    } else {
      requiredRole = 'business_user';
      rationale = `Standard agreement within low-risk threshold. Routine departmental sign-off eligible.`;
    }

    // Find active user with the matching role in this organization
    const reviewer = await User.findOne({
      organizationId,
      role: requiredRole,
      isActive: true,
    }).select('_id name email role');

    // Fallback to admin if role not found
    const fallbackReviewer = reviewer || await User.findOne({ organizationId, role: 'admin' }).select('_id name email role');

    return {
      suggestedReviewer: fallbackReviewer,
      requiredRole,
      rationale,
      stages: [
        { name: 'Intake & OCR Extraction', status: 'completed' },
        { name: 'AI Risk & Precedent Analysis', status: 'completed' },
        { name: 'Legal Counsel Review', status: 'active' },
        { name: 'Counterparty Negotiation', status: 'pending' },
        { name: 'Executive Sign-off', status: 'pending' },
        { name: 'Execution & Obligation Tracking', status: 'pending' },
      ],
    };
  }

  validateStatusTransition(currentStatus, newStatus, userRole) {
    const validTransitions = {
      'Draft': ['Submitted', 'Archived'],
      'Submitted': ['Under Review', 'Changes Requested', 'Archived'],
      'Under Review': ['Negotiation', 'Pending Approval', 'Changes Requested', 'Rejected'],
      'Changes Requested': ['Submitted', 'Under Review'],
      'Negotiation': ['Pending Approval', 'Under Review', 'Changes Requested'],
      'Pending Approval': ['Approved', 'Changes Requested', 'Under Review'],
      'Approved': ['Signed', 'Active'],
      'Signed': ['Active', 'Archived'],
      'Active': ['Expired', 'Terminated', 'Archived'],
      'Expired': ['Archived', 'Active'],
      'Terminated': ['Archived'],
      'Archived': ['Draft'],
    };

    // Business users cannot approve contracts
    if (newStatus === 'Approved' && userRole === 'business_user') {
      return {
        allowed: false,
        reason: 'Business Users are not authorized to grant final contract approval. Legal Counsel or Admin approval required.',
      };
    }

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      return {
        allowed: false,
        reason: `Cannot transition contract status directly from '${currentStatus}' to '${newStatus}'.`,
      };
    }

    return { allowed: true };
  }
}

module.exports = new WorkflowAgent();
