const mongoose = require('mongoose');

const questSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    tasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        completedAt: { type: Date, default: null },
      },
    ],
    heartReward: { type: Number, default: 50 },
    type: {
      type: String,
      enum: ['weekly', 'daily', 'special'],
      default: 'weekly',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
    },
    weekStart: { type: Date },
    weekEnd: { type: Date },
  },
  { timestamps: true }
);

questSchema.index({ coupleId: 1, status: 1 });

module.exports = mongoose.model('Quest', questSchema);
