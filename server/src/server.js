const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/database');
const { seedInitialData } = require('./utils/seedData');

const server = http.createServer(app);

// Initialize Socket.io for live legal workflow and approval notifications
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Realtime client connected: ${socket.id}`);

  socket.on('join_organization', (orgId) => {
    socket.join(`org_${orgId}`);
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// Attach io to app so controllers can broadcast events
app.set('io', io);

const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed demo records if DB is clean
    await seedInitialData();

    server.listen(env.port, () => {
      console.log('================================================================');
      console.log(`⚖️  LexiMem AI Contract Lifecycle Platform Server Running`);
      console.log(`📍 Port: http://localhost:${env.port}`);
      console.log(`🧠 Precedent Engine: Hindsight (${env.hindsight.baseUrl})`);
      console.log(`🤖 AI LLM: Groq (${env.groq.model})`);
      console.log(`💼 Ready for Contract Intake, Risk Analysis & Precedent Memory`);
      console.log('================================================================');
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
