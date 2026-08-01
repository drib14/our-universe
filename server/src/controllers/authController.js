const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generatePairCode,
  generateVerificationCode,
} = require('../utils/tokens');
const { sendEmail, emailTemplates } = require('../config/email');
const { uploadToCloudinary } = require('../utils/upload');

/**
 * POST /api/auth/register
 * Direct registration without email verification; sets isVerified to true automatically.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, relationshipStartDate } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Generate pair code
    const pairCode = generatePairCode();

    // Create user (isVerified set to true directly)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      pairCode,
      relationshipStartDate,
      isVerified: true,
    });

    // Send warm welcome email (optional non-blocking)
    const welcomeSubject = '💕 Welcome to Pairly — Your Shared Universe';
    const welcomeHtml = `<div font-family: sans-serif;><h2>Welcome to Pairly, ${name}!</h2><p>Your private relationship space is ready. Share your pair code <strong>${pairCode}</strong> with your partner to get started.</p></div>`;
    sendEmail(email, welcomeSubject, welcomeHtml).catch((err) =>
      console.error('Welcome email send failed:', err.message)
    );

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: hashToken(refreshToken) },
    });

    res.status(201).json({
      success: true,
      message: `Welcome to Pairly, ${name}! Your account is ready.`,
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: hashToken(refreshToken) },
    });

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const hashedToken = hashToken(refreshToken);

    const user = await User.findById(decoded.userId).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(hashedToken)) {
      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. Please log in again.',
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== hashedToken);
    user.refreshTokens.push(hashToken(newRefreshToken));

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. Please log in again.',
      });
    }
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: hashedToken },
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Sends 6-digit OTP verification code specifically for password reset process.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: true,
        message: 'If this email exists, a 6-digit reset code has been sent.',
      });
    }

    const code = generateVerificationCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const template = emailTemplates.passwordReset(user.name, code);
    await sendEmail(user.email, template.subject, template.html);

    res.json({
      success: true,
      message: 'If this email exists, a 6-digit reset code has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Verifies the 6-digit reset code and updates the user's password.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+resetPasswordCode +resetPasswordExpires');

    if (!user || user.resetPasswordCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Invalidate active sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('partnerId', 'name avatar email')
      .populate('coupleId');

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, birthday, bio, relationshipStartDate, settings } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (birthday) updates.birthday = birthday;
    if (relationshipStartDate) updates.relationshipStartDate = relationshipStartDate;
    if (bio !== undefined) updates.bio = bio;
    if (settings) updates.settings = { ...req.user.settings, ...settings };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image');
      updates.avatar = { url: result.url, publicId: result.publicId };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated!',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/push-token
 */
const updatePushToken = async (req, res, next) => {
  try {
    const { pushToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { pushToken });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  updatePushToken,
};
