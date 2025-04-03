// server.js - Updated with bike route endpoints
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const mainRoutes = require('./routes/routes');
const poiRoutes = require('./routes/poi.routes'); 
const bikeRouteRoutes = require('./routes/bike-routes.routes'); // Import the bike route routes

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure console for better debugging
console.logDetailed = (prefix, obj) => {
  console.log(`\n==== ${prefix} ====`);
  console.log(typeof obj === 'object' ? JSON.stringify(obj, null, 2) : obj);
  console.log(`==== End ${prefix} ====\n`);
};

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory at:', uploadDir);
}

// Ensure GPX uploads directory exists
const gpxUploadDir = path.join(__dirname, 'uploads/gpx');
if (!fs.existsSync(gpxUploadDir)) {
  fs.mkdirSync(gpxUploadDir, { recursive: true });
  console.log('Created GPX uploads directory at:', gpxUploadDir);
}

// CORS setup with more options
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with increased limit and detailed error handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('Request body:', req.body);
  }
  
  // Track response for logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Static files
app.use('/uploads', express.static(uploadDir));

// Routes
// Explicitly log when routes are registered
console.log('Registering route handlers...');
app.use('/api', mainRoutes); // Main routes from routes.js
console.log('Main routes registered at /api');
app.use('/api/pois', poiRoutes); // POI-specific routes from poi.routes.js
console.log('POI routes registered at /api/pois');
app.use('/api/bike-routes', bikeRouteRoutes); // Bike route-specific routes
console.log('Bike route routes registered at /api/bike-routes');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API not found handler
app.use('/api/*', (req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Production setup: Serve static frontend files
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../frontend/build');
  
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('Frontend build directory not found at:', clientBuildPath);
  }
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  console.error('Error stack:', err.stack);
  
  // Format validation errors if present
  let errorDetails = undefined;
  if (err.name === 'ValidationError') {
    errorDetails = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }
  
  res.status(500).json({ 
    success: false, 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    details: errorDetails,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mongo_user_rw:0qLDVmYOimDWUBkq@cluster0.dcoa6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Log URI with hidden credentials

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  
  // Get database information
  const dbName = mongoose.connection.name;
  const collections = mongoose.connection.collections;
  console.log(`Database name: ${dbName}`);
  console.log(`Available collections: ${Object.keys(collections).join(', ') || 'none yet'}`);
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
    console.log(`Bike Routes API available at: http://localhost:${PORT}/api/bike-routes`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Connection details:', {
    uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process to maintain service availability
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Exit with error in production, stay alive in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app;