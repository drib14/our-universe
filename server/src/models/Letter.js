const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Letter title is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      default: '',
    },
    unlockDate: {
      type: Date,
      required: [true, 'Unlock date is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'sealed', 'unlocked', 'read', 'archived'],
      default: 'draft',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'audio', 'video', 'music'],
        },
        url: String,
        publicId: String,
        metadata: {
          duration: Number,
          width: Number,
          height: Number,
          songTitle: String,
          songArtist: String,
          spotifyUri: String,
        },
      },
    ],
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: {
          type: String,
          enum: ['❤️', '🥹', '😭', '😍', '🫶', '💕', '🔥', '😂'],
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual: is the letter unlocked yet?
letterSchema.virtual('isUnlocked').get(function () {
  return new Date() >= this.unlockDate;
});

// Virtual: time remaining until unlock
letterSchema.virtual('timeUntilUnlock').get(function () {
  const diff = this.unlockDate - Date.now();
  return diff > 0 ? diff : 0;
});

letterSchema.set('toJSON', { virtuals: true });
letterSchema.set('toObject', { virtuals: true });

letterSchema.index({ coupleId: 1, status: 1 });
letterSchema.index({ receiverId: 1, unlockDate: 1 });

module.exports = mongoose.model('Letter', letterSchema);
