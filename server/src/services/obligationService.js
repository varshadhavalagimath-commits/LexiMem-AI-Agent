const Obligation = require('../models/Obligation');
const Contract = require('../models/Contract');
const { logAudit } = require('../middleware/auditLogger');

class ObligationService {
  async getObligations(organizationId, query = {}) {
    // Sync overdue statuses automatically
    const now = new Date();
    await Obligation.updateMany(
      { dueDate: { $lt: now }, status: { $in: ['pending', 'in_progress'] } },
      { status: 'overdue' }
    );

    const filter = {};
    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }
    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }
    if (query.priority && query.priority !== 'All') {
      filter.priority = query.priority;
    }
    if (query.contractId) {
      filter.contractId = query.contractId;
    }

    const obligations = await Obligation.find(filter)
      .populate('contractId', 'title contractType status')
      .populate('assignedTo', 'name email role')
      .sort({ dueDate: 1 });

    const totalCount = obligations.length;
    const overdueCount = obligations.filter(o => o.status === 'overdue').length;
    const completedCount = obligations.filter(o => o.status === 'completed').length;
    const pendingCount = obligations.filter(o => o.status === 'pending' || o.status === 'in_progress').length;

    return {
      obligations,
      stats: {
        total: totalCount,
        overdue: overdueCount,
        completed: completedCount,
        pending: pendingCount,
      },
    };
  }

  async updateObligation(id, updates, user) {
    const obligation = await Obligation.findById(id);
    if (!obligation) throw new Error('Obligation not found.');

    if (updates.status) {
      obligation.status = updates.status;
      if (updates.status === 'completed') {
        obligation.completedAt = new Date();
      }
    }

    if (updates.completionNotes) {
      obligation.completionNotes = updates.completionNotes;
    }

    if (updates.dueDate) {
      obligation.dueDate = new Date(updates.dueDate);
    }

    if (updates.priority) {
      obligation.priority = updates.priority;
    }

    await obligation.save();

    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'OBLIGATION_UPDATED',
      resourceType: 'obligation',
      resourceId: obligation._id,
      resourceTitle: obligation.description,
      details: updates,
    });

    return obligation;
  }

  async getRenewalAlerts(organizationId) {
    const now = new Date();
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 3600 * 1000);

    const contracts = await Contract.find({
      organizationId,
      status: { $in: ['Active', 'Under Review', 'Approved'] },
      expirationDate: { $gte: now, $lte: ninetyDays },
    }).sort({ expirationDate: 1 });

    const alerts = contracts.map(c => {
      const daysLeft = Math.ceil((new Date(c.expirationDate) - now) / (1000 * 3600 * 24));
      const noticeDaysLeft = c.renewalNoticeDueDate ? Math.ceil((new Date(c.renewalNoticeDueDate) - now) / (1000 * 3600 * 24)) : daysLeft - (c.renewalNoticePeriodDays || 30);

      let urgency = 'low';
      if (noticeDaysLeft <= 7) urgency = 'critical';
      else if (noticeDaysLeft <= 30) urgency = 'high';
      else if (noticeDaysLeft <= 60) urgency = 'medium';

      return {
        contractId: c._id,
        title: c.title,
        contractType: c.contractType,
        counterparty: c.counterparty,
        expirationDate: c.expirationDate,
        daysToExpiry: daysLeft,
        renewalNoticeDueDate: c.renewalNoticeDueDate,
        daysToNoticeDeadline: noticeDaysLeft,
        noticePeriodDays: c.renewalNoticePeriodDays || 30,
        urgency,
        status: c.status,
      };
    });

    return alerts;
  }
}

module.exports = new ObligationService();
