const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'Liability',
      'Indemnification',
      'Confidentiality',
      'Termination',
      'Governing Law',
      'Data Protection',
      'Payment',
      'Intellectual Property',
      'General'
    ],
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  standardTerm: {
    type: String,
    required: true,
  },
  unacceptablePhrases: [{
    type: String,
  }],
  liabilityCapRule: {
    capType: { type: String, enum: ['contract_value_multiple', 'fixed_amount', 'none'], default: 'contract_value_multiple' },
    multiplier: { type: Number, default: 1 },
    fixedCapUsd: { type: Number, default: 500000 },
  },
  approvedJurisdictions: [{
    type: String,
  }],
  mandatoryNoticeDays: {
    type: Number,
    default: 30,
  },
  strictness: {
    type: String,
    enum: ['mandatory', 'recommended', 'guideline'],
    default: 'mandatory',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Policy', policySchema);
