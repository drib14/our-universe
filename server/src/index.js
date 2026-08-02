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
  'http://localhost:8081',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8081',
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.replace(/\/$/, '');
  if (allowedOrigins.some((o) => o && o.replace(/\/$/, '') === cleanOrigin)) return true;
  try {
    const hostname = new URL(origin).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.onrender.com')) {
      return true;
    }
  } catch (e) {}
  return process.env.NODE_ENV !== 'production';
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

// Initialize Express
const app = express();
app.set('trust proxy', 1);
app.disable('etag');
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Initialize socket handlers
initializeSocket(io);

// ── MIDDLEWARE ──
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
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
