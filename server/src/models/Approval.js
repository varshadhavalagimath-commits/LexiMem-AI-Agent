const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  decision: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'changes_requested'],
    default: 'pending',
    required: true,
    index: true,
  },
  comments: {
    type: String,
    default: '',
  },
  stage: {
    type: String,
    enum: ['initial_review', 'legal_review', 'risk_approval', 'executive_signoff'],
    default: 'legal_review',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Approval', approvalSchema);
