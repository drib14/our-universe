const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      default: null,
    },
    pairCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    birthday: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 200,
    },

    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },

    // Password reset
    resetPasswordCode: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    // Refresh tokens (hashed)
    refreshTokens: {
      type: [String],
      select: false,
    },

    // Push notifications
    pushToken: {
      type: String,
      default: null,
    },

    // Spotify
    spotifyAccessToken: {
      type: String,
      select: false,
    },
    spotifyRefreshToken: {
      type: String,
      select: false,
    },

    // Settings
    settings: {
      notifications: {
        letters: { type: Boolean, default: true },
        moods: { type: Boolean, default: true },
        chat: { type: Boolean, default: true },
        quests: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.verificationCode;
  delete user.verificationCodeExpires;
  delete user.resetPasswordCode;
  delete user.resetPasswordExpires;
  delete user.spotifyAccessToken;
  delete user.spotifyRefreshToken;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
