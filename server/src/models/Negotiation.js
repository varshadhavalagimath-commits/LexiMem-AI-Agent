const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
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
  clauseCategory: {
    type: String,
    required: true,
  },
  originalClause: {
    type: String,
    required: true,
  },
  aiSuggestion: {
    type: String,
  },
  approvedPrecedentText: {
    type: String,
  },
  proposedClause: {
    type: String,
  },
  pros: [{
    type: String,
  }],
  cons: [{
    type: String,
  }],
  rationale: {
    type: String,
  },
  counterproposals: [{
    proposer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    wording: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['draft', 'counterproposal_sent', 'accepted', 'rejected', 'escalated'],
    default: 'draft',
    index: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Negotiation', negotiationSchema);
