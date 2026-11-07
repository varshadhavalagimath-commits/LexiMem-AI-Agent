const mongoose = require('mongoose');

const riskFindingSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true,
  },
  clauseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clause',
    index: true,
  },
  riskTitle: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'],
    required: true,
    index: true,
  },
  clauseText: {
    type: String,
    required: true,
  },
  pageNumber: {
    type: Number,
    default: 1,
  },
  clauseReference: {
    type: String,
    default: 'Section Unspecified',
  },
  explanation: {
    type: String,
    required: true,
  },
  businessImpact: {
    type: String,
    required: true,
  },
  suggestedAction: {
    type: String,
    required: true,
  },
  relevantPolicy: {
    type: String,
  },
  relevantPrecedent: {
    precedentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Precedent' },
    summary: String,
    approvedWording: String,
    similarityScore: Number,
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 90,
  },
  status: {
    type: String,
    enum: ['open', 'in_negotiation', 'mitigated', 'accepted_risk'],
    default: 'open',
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RiskFinding', riskFindingSchema);
