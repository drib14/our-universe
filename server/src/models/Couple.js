const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema(
  {
    partner1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    partner2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    anniversaryDate: {
      type: Date,
      default: null,
    },
    coupleNickname: {
      type: String,
      default: '',
      maxlength: 50,
    },
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active',
    },
    stats: {
      totalHearts: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      completedQuests: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: get partner given a userId
coupleSchema.methods.getPartner = function (userId) {
  return this.partner1.toString() === userId.toString()
    ? this.partner2
    : this.partner1;
};

// Virtual: days together
coupleSchema.virtual('daysTogether').get(function () {
  if (!this.anniversaryDate) return 0;
  const diff = Date.now() - new Date(this.anniversaryDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

coupleSchema.set('toJSON', { virtuals: true });
coupleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Couple', coupleSchema);
