const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Secret Key (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// In-memory cache for Google Sheets data (in production, consider Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { initializeGoogleSheets } = require("./services/googleSheetsService");

// Initialize Google Sheets service
initializeGoogleSheets()
  .then(() => console.log("Google Sheets service initialized."))
  .catch((err) => console.error("Failed to initialize Google Sheets service:", err));

// Import routes
const questionsRouter = require('./routes/questions');
const contentRouter = require('./routes/content');

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Cache helper functions
const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const getCache = (key) => {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple admin user check (in production, use proper user management)
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUser && password === adminPassword) {
      const token = jwt.sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ 
        token, 
        user: { username, role: 'admin' },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token validation endpoint
app.get('/api/auth/validate', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Cache invalidation endpoint (for Google Apps Script webhook)
app.post('/api/cache/invalidate', (req, res) => {
  const { sheet_name } = req.body;
  
  if (sheet_name) {
    // Invalidate specific sheet cache
    for (const [key] of cache) {
      if (key.includes(sheet_name.toLowerCase())) {
        cache.delete(key);
      }
    }
  } else {
    // Clear all cache
    cache.clear();
  }
  
  res.json({ 
    message: 'Cache invalidated successfully',
    remaining_cache_size: cache.size
  });
});

// Make cache functions available to routes
app.locals.setCache = setCache;
app.locals.getCache = getCache;

// Use routes
app.use('/api/questions', questionsRouter);
app.use('/api/content', contentRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Interactive Letter API is running',
    timestamp: new Date().toISOString(),
    cache_size: cache.size,
    cache_ttl_seconds: CACHE_TTL / 1000
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`JWT Secret configured: ${JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`Cache TTL: ${CACHE_TTL / 1000} seconds`);
  console.log(`Admin credentials: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
});

module.exports = app;

