const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const env = require('../config/env');
const { logAudit } = require('../middleware/auditLogger');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'business_user', organizationName = 'Apex Global Technologies' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
    }

    // Find or create organization
    let org = await Organization.findOne({ name: organizationName });
    if (!org) {
      org = await Organization.create({
        name: organizationName,
        domain: email.split('@')[1] || 'leximem.com',
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      organizationId: org._id,
      department: role === 'lawyer' ? 'Legal Affairs' : role === 'admin' ? 'Operations & IT' : 'Procurement',
    });

    const token = generateToken(user);

    await logAudit({ user, organizationId: org._id }, {
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: user._id,
      resourceTitle: user.name,
      details: { role: user.role, email: user.email },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organizationId: org._id,
        organizationName: org.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).populate('organizationId');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    await logAudit({ user, organizationId: user.organizationId?._id || user.organizationId }, {
      action: 'USER_LOGGED_IN',
      resourceType: 'user',
      resourceId: user._id,
      resourceTitle: user.name,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organizationId: user.organizationId?._id,
        organizationName: user.organizationId?.name || 'LexiMem Enterprise',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('organizationId', 'name domain settings');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organization: user.organizationId,
      },
    });
  } catch (err) {
    next(err);
  }
};
