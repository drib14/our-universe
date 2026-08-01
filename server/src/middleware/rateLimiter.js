const rateLimit = require('express-rate-limit');

// Auth routes: strict limiting (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.',
    code: 'RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload routes: stricter limit
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many uploads. Please try again later.',
    code: 'RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, uploadLimiter };
