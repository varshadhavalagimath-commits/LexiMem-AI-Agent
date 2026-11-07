const mongoose = require('mongoose');

const obligationSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true,
  },
  contractTitle: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'payment',
      'service_delivery',
      'renewal_notice',
      'confidentiality',
      'reporting',
      'maintenance',
      'termination_notice',
      'compliance',
      'other'
    ],
    default: 'compliance',
    index: true,
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedName: {
    type: String,
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending',
    index: true,
  },
  completionNotes: {
    type: String,
  },
  completedAt: {
    type: Date,
  },
  reminderNoticeDays: {
    type: [Number],
    default: [30, 14, 7, 1],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Obligation', obligationSchema);
