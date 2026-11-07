const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true,
  },
  versionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContractVersion',
  },
  category: {
    type: String,
    enum: [
      'Liability',
      'Indemnification',
      'Confidentiality',
      'Termination',
      'Payment',
      'Governing Law',
      'Intellectual Property',
      'Dispute Resolution',
      'Data Protection',
      'Non-Compete',
      'Warranties',
      'Force Majeure',
      'Other'
    ],
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
  },
  clauseReference: {
    type: String,
    default: 'Section Unspecified',
  },
  pageNumber: {
    type: Number,
    default: 1,
  },
  riskLevel: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'],
    default: 'Low',
    index: true,
  },
  analysis: {
    summary: String,
    flaggedIssues: [String],
    confidenceScore: Number,
  },
  matchedPrecedentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Precedent',
  },
  status: {
    type: String,
    enum: ['unreviewed', 'flagged', 'negotiating', 'accepted', 'rejected'],
    default: 'unreviewed',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Clause', clauseSchema);
