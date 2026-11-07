const mongoose = require('mongoose');

const contractVersionSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  fileReference: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    filePath: String,
  },
  extractedText: {
    type: String,
    required: true,
  },
  changeSummary: {
    type: String,
  },
  differences: [{
    section: String,
    changeType: {
      type: String,
      enum: ['added', 'removed', 'modified', 'unchanged'],
    },
    oldText: String,
    newText: String,
    impactNote: String,
    altersApprovedPrecedent: {
      type: Boolean,
      default: false,
    },
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

contractVersionSchema.index({ contractId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model('ContractVersion', contractVersionSchema);
