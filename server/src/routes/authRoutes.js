const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  updatePushToken,
  scheduleAccountDeletion,
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../utils/upload');

// Public routes (with rate limiting)
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/refresh', refresh);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }),
    body('newPassword').isLength({ min: 6 }),
  ],
  resetPassword
);

// Protected routes
router.post('/logout', auth, logout);

router.get('/me', auth, getMe);

router.put('/profile', auth, upload.single('avatar'), updateProfile);

router.post('/delete-account', auth, scheduleAccountDeletion);

router.put(
  '/push-token',
  auth,
  [body('pushToken').notEmpty()],
  updatePushToken
);

module.exports = router;
