const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'pairly_default_access_token_secret_key_2026';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'pairly_default_refresh_token_secret_key_2026';

/**
 * Generate an access token (7 days)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, ACCESS_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Generate a long-lived refresh token (30 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
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
