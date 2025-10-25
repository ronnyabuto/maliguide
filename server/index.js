import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import marketDataRoutes from './routes/marketData.js';
import portfolioRoutes from './routes/portfolio.js';
import aiRoutes from './routes/ai.js';
import sentimentRoutes from './routes/sentiment.js';
import userProfileRoutes from './routes/userProfile.js';
import notificationRoutes from './routes/notifications.js';
import { startDataIngestion } from './scrapers/index.js';
import { initializeDatabase } from './database/init.js';
import { notificationService } from './services/notificationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: {
      sentiment_analysis: true,
      ai_recommendations: true,
      real_time_data: true,
      user_profiles: true,
      notifications: true
    }
  });
});

// API Routes
app.use('/api/market', marketDataRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Starting data ingestion services...');
    await startDataIngestion();
    
    console.log('Initializing notification service...');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Market data ingestion active`);
      console.log(`AI sentiment analysis enabled`);
      console.log(`User profiles enabled`);
      console.log(`Notifications system active`);
      console.log(`API available at http://localhost:${PORT}`);
      console.log(`Sentiment API: http://localhost:${PORT}/api/sentiment`);
      console.log(`Profile API: http://localhost:${PORT}/api/profile`);
      console.log(`Notifications API: http://localhost:${PORT}/api/notifications`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();