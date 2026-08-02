const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a short-lived access token (15 minutes)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Generate a long-lived refresh token (30 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

/**
 * Hash a token for safe DB storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a 6-digit pairing code (cryptographically secure)
 */
const generatePairCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Generate a 6-digit verification code (cryptographically secure)
 */
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generatePairCode,
  generateVerificationCode,
};
