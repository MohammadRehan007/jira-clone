const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedInitialData } = require('./utils/seedData');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS & JSON Parsing
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Jira Ticketing Tool Backend API',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/sprints', require('./routes/sprintRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
const startServer = async () => {
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      await seedInitialData().catch((err) =>
        console.warn('[Seed Warning]', err.message)
      );
    }
  } catch (err) {
    console.error('[Database Init Error]', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Jira Express Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();
