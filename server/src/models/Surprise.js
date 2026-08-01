const mongoose = require('mongoose');

const surpriseSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['sad', 'birthday', 'missing_me', 'achievement', 'fight', 'random'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '' },
    attachments: [
      {
        type: { type: String, enum: ['letter', 'voice', 'song', 'gif', 'photo', 'coupon'] },
        url: String,
        publicId: String,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    coupon: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      isRedeemed: { type: Boolean, default: false },
      redeemedAt: { type: Date, default: null },
    },
    isOpened: { type: Boolean, default: false },
    openedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

surpriseSchema.index({ coupleId: 1, category: 1 });

module.exports = mongoose.model('Surprise', surpriseSchema);
