const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also load root .env if available
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/leximem',
  jwtSecret: process.env.JWT_SECRET || 'leximem_enterprise_jwt_secure_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Groq API
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.1,
    maxTokens: parseInt(process.env.GROQ_MAX_TOKENS, 10) || 4096,
  },
  
  // Hindsight Persistent Memory
  hindsight: {
    baseUrl: process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io',
    apiKey: process.env.HINDSIGHT_API_KEY || '',
    bankId: process.env.HINDSIGHT_BANK_ID || 'leximem-precedents',
  },
  
  // Microservices & Storage
  docProcessorUrl: process.env.DOC_PROCESSOR_URL || 'http://localhost:8000',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 25,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
