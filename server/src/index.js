require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initializeSocket } = require('./socket/chatHandler');

let mongoSanitize;
try {
  mongoSanitize = require('express-mongo-sanitize');
} catch (e) {
  mongoSanitize = () => (req, res, next) => next();
}

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://pairly-web.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy restriction: Origin not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Initialize socket handlers
initializeSocket(io);

// ── MIDDLEWARE ──
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors(corsOptions));
if (mongoSanitize) {
  app.use(mongoSanitize());
}
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting on all API routes
app.use('/api', apiLimiter);

// ── ROUTES ──
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Pairly API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/couple', require('./routes/coupleRoutes'));
app.use('/api/letters', require('./routes/letterRoutes'));
app.use('/api/timeline', require('./routes/timelineRoutes'));
app.use('/api/moods', require('./routes/moodRoutes'));
app.use('/api/surprises', require('./routes/surpriseRoutes'));
app.use('/api/memories', require('./routes/memoryRoutes'));
app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/spotify', require('./routes/spotifyRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Spotify OAuth callback (needs to be outside of auth middleware)
app.get('/api/auth/spotify/callback', require('./controllers/spotifyController').authCallback);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// ── START SERVER ──
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║     Pairly API Server                ║
║     Running on port ${PORT}              ║
║     Environment: ${process.env.NODE_ENV || 'development'}     ║
╚══════════════════════════════════════╝
    `);
  });
};

startServer();

module.exports = { app, server, io };
