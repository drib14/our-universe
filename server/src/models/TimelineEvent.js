const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    icon: { type: String, default: '❤️' },
    category: {
      type: String,
      enum: ['first_chat', 'first_date', 'anniversary', 'birthday', 'milestone', 'trip', 'custom'],
      default: 'custom',
    },
    media: [
      {
        type: { type: String, enum: ['image', 'video'] },
        url: String,
        publicId: String,
        thumbnail: String,
      },
    ],
    location: {
      name: { type: String, default: '' },
      lat: Number,
      lng: Number,
    },
    tags: [{ type: String, trim: true }],
    mood: { type: String, default: '' },
    weather: { type: String, default: '' },
    song: {
      title: { type: String, default: '' },
      artist: { type: String, default: '' },
      spotifyUri: { type: String, default: '' },
    },
    people: [{ type: String, trim: true }],
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

timelineEventSchema.index({ coupleId: 1, date: -1 });

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
