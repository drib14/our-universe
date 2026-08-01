const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, default: '' },
    type: {
      type: String,
      enum: ['text', 'image', 'voice', 'gif', 'sticker'],
      default: 'text',
    },
    mediaUrl: { type: String, default: '' },
    mediaPublicId: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
