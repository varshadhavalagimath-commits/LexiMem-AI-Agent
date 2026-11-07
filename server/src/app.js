const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const contractRoutes = require('./routes/contractRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const precedentRoutes = require('./routes/precedentRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const obligationRoutes = require('./routes/obligationRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const policyRoutes = require('./routes/policyRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded original contracts securely
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LexiMem Legal AI Platform Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/precedents', precedentRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/obligations', obligationRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
