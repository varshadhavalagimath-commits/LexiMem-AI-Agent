const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  userName: {
    type: String,
    default: 'System',
  },
  userEmail: {
    type: String,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resourceType: {
    type: String,
    enum: ['contract', 'precedent', 'risk', 'approval', 'negotiation', 'obligation', 'policy', 'user', 'system'],
    required: true,
    index: true,
  },
  resourceId: {
    type: String,
    index: true,
  },
  resourceTitle: {
    type: String,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
