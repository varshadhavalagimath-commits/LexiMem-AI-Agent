const Contract = require('../models/Contract');
const Clause = require('../models/Clause');
const RiskFinding = require('../models/RiskFinding');
const agentOrchestrator = require('../agents/AgentOrchestrator');

exports.triggerAnalysis = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const contract = await Contract.findOne({ _id: contractId, organizationId: req.organizationId });
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    // Fetch existing clauses or rerun text analysis
    const clauses = await Clause.find({ contractId });
    const fullText = clauses.map(c => c.text).join('\n\n');

    const analysis = await agentOrchestrator.analysisAgent.analyze(fullText, contract.contractType);

    contract.riskScore = analysis.riskScore;
    contract.riskLevel = analysis.overallRiskLevel;
    contract.aiReviewSummary = analysis.reviewSummary;
    await contract.save();

    res.json({
      success: true,
      message: 'AI risk and clause re-analysis completed.',
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
};

exports.getContractAnalysis = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const contract = await Contract.findOne({ _id: contractId, organizationId: req.organizationId });
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    const clauses = await Clause.find({ contractId }).populate('matchedPrecedentId');
    const risks = await RiskFinding.find({ contractId }).sort({ severity: 1 });

    res.json({
      success: true,
      data: {
        contractId,
        riskScore: contract.riskScore,
        riskLevel: contract.riskLevel,
        aiReviewSummary: contract.aiReviewSummary,
        clauses,
        riskFindings: risks,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getRisks = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const filter = { contractId };
    if (req.query.severity && req.query.severity !== 'All') {
      filter.severity = req.query.severity;
    }

    const risks = await RiskFinding.find(filter).sort({ severity: 1 });
    res.json({ success: true, data: risks });
  } catch (err) {
    next(err);
  }
};
