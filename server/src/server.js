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

// Register API Routes (Both /api and direct root prefix supported)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const sprintRoutes = require('./routes/sprintRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/projects', '/projects'], projectRoutes);
app.use(['/api/sprints', '/sprints'], sprintRoutes);
app.use(['/api/tickets', '/tickets'], ticketRoutes);
app.use(['/api/comments', '/comments'], commentRoutes);
app.use(['/api/upload', '/upload'], uploadRoutes);

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
