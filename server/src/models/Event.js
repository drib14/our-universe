const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
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
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    endDate: { type: Date, default: null },
    type: {
      type: String,
      enum: ['anniversary', 'birthday', 'date_night', 'trip', 'custom'],
      default: 'custom',
    },
    icon: { type: String, default: '📅' },
    isRecurring: { type: Boolean, default: false },
    recurrenceRule: { type: String, default: '' }, // yearly, monthly
    reminder: {
      enabled: { type: Boolean, default: true },
      before: { type: Number, default: 1440 }, // minutes before (default 1 day)
    },
  },
  { timestamps: true }
);

eventSchema.index({ coupleId: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
