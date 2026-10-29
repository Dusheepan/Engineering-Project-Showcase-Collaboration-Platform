// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const commentRoutes = require('./routes/commentRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express application
const app = express();

// Set port from environment variable with fallback to 5001
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root / Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Engineering Showcase API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      comments: '/api/comments',
      collaborations: '/api/collaborations',
      health: '/',
    },
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/collaborations', collaborationRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server only when run directly (e.g. node server.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Engineering Showcase server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
