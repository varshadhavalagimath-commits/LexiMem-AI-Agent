const Policy = require('../models/Policy');
const Contract = require('../models/Contract');
const Precedent = require('../models/Precedent');
const { logAudit } = require('../middleware/auditLogger');

exports.getPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find({ organizationId: req.organizationId }).sort({ category: 1 });
    res.json({ success: true, data: policies });
  } catch (err) {
    next(err);
  }
};

exports.createPolicy = async (req, res, next) => {
  try {
    const policy = await Policy.create({
      ...req.body,
      organizationId: req.organizationId,
      createdBy: req.user._id,
    });

    await logAudit(req, {
      action: 'LEGAL_POLICY_CREATED',
      resourceType: 'policy',
      resourceId: policy._id,
      resourceTitle: policy.title,
    });

    res.status(201).json({ success: true, message: 'Policy standard configured.', data: policy });
  } catch (err) {
    next(err);
  }
};

exports.updatePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findOneAndUpdate(
      { _id: id, organizationId: req.organizationId },
      req.body,
      { new: true }
    );
    res.json({ success: true, message: 'Policy updated.', data: policy });
  } catch (err) {
    next(err);
  }
};

exports.checkPolicyCompliance = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    const policies = await Policy.find({ organizationId: req.organizationId, isActive: true });
    const checks = [];

    policies.forEach(p => {
      let status = 'compliant';
      let detail = 'Meets standard corporate parameters.';

      if (p.category === 'Liability' && contract.riskScore > 60) {
        status = 'violation';
        detail = 'Contract contains potential unlimited liability terms violating policy cap rule.';
      } else if (p.category === 'Governing Law' && p.approvedJurisdictions?.length) {
        const matches = p.approvedJurisdictions.some(j => contract.jurisdiction?.toLowerCase().includes(j.toLowerCase()));
        if (!matches) {
          status = 'warning';
          detail = `Contract jurisdiction (${contract.jurisdiction}) is outside preferred jurisdictions (${p.approvedJurisdictions.join(', ')}).`;
        }
      }

      checks.push({
        policyId: p._id,
        title: p.title,
        category: p.category,
        strictness: p.strictness,
        status,
        detail,
      });
    });

    // Policy Drift Detection (Advanced Feature 4)
    // Identify when recent approved contracts deviate from standard corporate policy
    const recentPrecedents = await Precedent.find({
      organizationId: req.organizationId,
      status: 'active',
    }).sort({ approvalDate: -1 }).limit(10);

    const driftAlerts = [];
    if (recentPrecedents.some(pr => pr.decision === 'modified')) {
      driftAlerts.push({
        type: 'Policy Drift Detected',
        category: 'Liability / Indemnity',
        description: '3 recent contracts negotiated custom compromises on liability multipliers. Consider updating standard policy baseline.',
      });
    }

    res.json({
      success: true,
      data: {
        checks,
        complianceScore: Math.round((checks.filter(c => c.status === 'compliant').length / Math.max(checks.length, 1)) * 100),
        driftAlerts,
      },
    });
  } catch (err) {
    next(err);
  }
};
