const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  domain: {
    type: String,
    trim: true,
  },
  settings: {
    hindsightBankId: {
      type: String,
      default: 'leximem-precedents',
    },
    defaultJurisdiction: {
      type: String,
      default: 'New York, USA',
    },
    riskThresholds: {
      critical: { type: Number, default: 80 },
      high: { type: Number, default: 60 },
      medium: { type: Number, default: 40 },
    },
    renewalNoticeDays: {
      type: [Number],
      default: [90, 60, 30, 7],
    },
    strictPrecedentEnforcement: {
      type: Boolean,
      default: false,
    },
  },
  policies: [{
    category: String,
    title: String,
    preferredLanguage: String,
    unacceptableTerms: [String],
    isMandatory: Boolean,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Organization', organizationSchema);
