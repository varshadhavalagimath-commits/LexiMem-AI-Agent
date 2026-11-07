const mongoose = require('mongoose');
const env = require('./env');

let mongodInstance = null;

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    
    // First attempt to connect to configured URI
    console.log(`[LexiMem DB] Attempting connection to MongoDB at: ${env.mongoUri.replace(/:([^:@]{3,})@/, ':****@')}`);
    
    const connPromise = mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    
    await connPromise;
    console.log(`[LexiMem DB] Successfully connected to MongoDB instance.`);
    return mongoose.connection;
  } catch (primaryErr) {
    console.warn(`[LexiMem DB] Direct connection failed (${primaryErr.message}).`);
    console.log(`[LexiMem DB] Starting embedded MongoDB Memory Server for zero-dependency execution...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[LexiMem DB] Connected to Embedded In-Memory MongoDB at: ${inMemoryUri}`);
      console.log(`[LexiMem DB] Note: Set MONGODB_URI in .env to use MongoDB Atlas or persistent local MongoDB.`);
      return mongoose.connection;
    } catch (fallbackErr) {
      console.error(`[LexiMem DB] Embedded database error:`, fallbackErr.message);
      throw fallbackErr;
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
