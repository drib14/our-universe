const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      // 1=😭, 2=😔, 3=😐, 4=😊, 5=😁
    },
    note: { type: String, default: '', maxlength: 500 },
    date: { type: String, required: true }, // YYYY-MM-DD format for unique index
  },
  { timestamps: true }
);

// One mood per user per day
moodEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
moodEntrySchema.index({ coupleId: 1, date: 1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
