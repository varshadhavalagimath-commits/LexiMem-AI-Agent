const mongoose = require('mongoose');

const precedentSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true,
  },
  contractTitle: {
    type: String,
    trim: true,
  },
  contractType: {
    type: String,
    required: true,
    index: true,
  },
  clauseCategory: {
    type: String,
    required: true,
    index: true,
  },
  originalClause: {
    type: String,
    required: true,
  },
  proposedClause: {
    type: String,
  },
  finalApprovedClause: {
    type: String,
    required: true,
  },
  decision: {
    type: String,
    enum: ['approved', 'rejected', 'modified', 'superseded'],
    default: 'approved',
    required: true,
    index: true,
  },
  reason: {
    type: String,
    required: true,
  },
  jurisdiction: {
    type: String,
    default: 'Delaware, USA',
    index: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvalDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'superseded', 'archived'],
    default: 'active',
    index: true,
  },
  supersededBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Precedent',
  },
  hindsightMemoryReference: {
    bankId: String,
    memoryId: String,
    retainedAt: Date,
    status: {
      type: String,
      enum: ['synced', 'local_backup', 'pending', 'error'],
      default: 'pending',
    },
    syncError: String,
  },
  userFeedback: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reaction: {
      type: String,
      enum: ['useful', 'not_relevant', 'incorrect', 'needs_review'],
    },
    comment: String,
    date: { type: Date, default: Date.now },
  }],
  relevanceCount: {
    type: Number,
    default: 0,
  },
  version: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Precedent', precedentSchema);
