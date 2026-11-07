const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  contractType: {
    type: String,
    enum: [
      'NDA',
      'Vendor Agreement',
      'Employment Agreement',
      'Service Agreement',
      'Lease Agreement',
      'Partnership Agreement',
      'Software Licensing Agreement',
      'Consulting Agreement',
      'Other'
    ],
    default: 'Service Agreement',
    index: true,
  },
  parties: [{
    type: String,
    trim: true,
  }],
  counterparty: {
    type: String,
    trim: true,
    index: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedReviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  originalFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    filePath: String,
    uploadDate: { type: Date, default: Date.now },
  },
  isScanned: {
    type: Boolean,
    default: false,
  },
  ocrRequired: {
    type: Boolean,
    default: false,
  },
  extractionConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 85,
  },
  extractedFields: {
    contractTitle: String,
    contractType: String,
    partyNames: [String],
    effectiveDate: String,
    expiryDate: String,
    paymentTerms: String,
    liabilityTerms: String,
    confidentialityTerms: String,
    terminationTerms: String,
    indemnificationTerms: String,
    disputeResolution: String,
    governingLaw: String,
    renewalTerms: String,
    obligations: [String],
    missingFields: [String],
  },
  jurisdiction: {
    type: String,
    default: 'Delaware, USA',
  },
  effectiveDate: {
    type: Date,
  },
  expirationDate: {
    type: Date,
    index: true,
  },
  renewalNoticePeriodDays: {
    type: Number,
    default: 30,
  },
  renewalNoticeDueDate: {
    type: Date,
  },
  renewalTerms: {
    type: String,
  },
  value: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'Under Review',
      'Changes Requested',
      'Negotiation',
      'Pending Approval',
      'Approved',
      'Signed',
      'Active',
      'Expired',
      'Terminated',
      'Archived'
    ],
    default: 'Submitted',
    index: true,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true,
  },
  riskLevel: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'],
    default: 'Low',
  },
  currentVersion: {
    type: Number,
    default: 1,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  aiReviewSummary: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Contract', contractSchema);
