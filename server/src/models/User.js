const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'lawyer', 'business_user'],
    default: 'business_user',
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  department: {
    type: String,
    default: 'Legal & Compliance',
  },
  permissions: [{
    type: String,
  }],
  avatarUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  if (!this.passwordHash.startsWith('$2a$') && !this.passwordHash.startsWith('$2b$')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
