const reportService = require('../services/reportService');
const Contract = require('../models/Contract');
const RiskFinding = require('../models/RiskFinding');
const Precedent = require('../models/Precedent');
const Obligation = require('../models/Obligation');

exports.getOverview = async (req, res, next) => {
  try {
    const data = await reportService.getDashboardAnalytics(req.organizationId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getRiskReport = async (req, res, next) => {
  try {
    const risks = await RiskFinding.find()
      .populate('contractId', 'title contractType jurisdiction status')
      .sort({ severity: 1 });
    res.json({ success: true, data: risks });
  } catch (err) {
    next(err);
  }
};

exports.getRenewalReport = async (req, res, next) => {
  try {
    const now = new Date();
    const oneYear = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
    const contracts = await Contract.find({
      organizationId: req.organizationId,
      expirationDate: { $gte: now, $lte: oneYear },
    }).sort({ expirationDate: 1 });

    res.json({ success: true, data: contracts });
  } catch (err) {
    next(err);
  }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const { type = 'contracts' } = req.query;

    if (type === 'contracts') {
      const contracts = await Contract.find({ organizationId: req.organizationId });
      let csv = 'Title,Type,Counterparty,Status,Risk Level,Risk Score,Jurisdiction,Effective Date,Expiration Date\n';
      contracts.forEach(c => {
        csv += `"${c.title}","${c.contractType}","${c.counterparty || ''}","${c.status}","${c.riskLevel}","${c.riskScore}","${c.jurisdiction || ''}","${c.effectiveDate ? c.effectiveDate.toISOString().split('T')[0] : ''}","${c.expirationDate ? c.expirationDate.toISOString().split('T')[0] : ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="LexiMem_Contracts_Report.csv"');
      return res.send(csv);
    } else if (type === 'precedents') {
      const precedents = await Precedent.find({ organizationId: req.organizationId });
      let csv = 'Category,Contract Type,Decision,Approved Clause,Reason,Jurisdiction,Date\n';
      precedents.forEach(p => {
        csv += `"${p.clauseCategory}","${p.contractType}","${p.decision}","${p.finalApprovedClause.replace(/"/g, '""')}","${p.reason.replace(/"/g, '""')}","${p.jurisdiction}","${p.approvalDate ? p.approvalDate.toISOString().split('T')[0] : ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="LexiMem_Precedents_Report.csv"');
      return res.send(csv);
    }

    res.status(400).json({ success: false, message: 'Invalid export type.' });
  } catch (err) {
    next(err);
  }
};
