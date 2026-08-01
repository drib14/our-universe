const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
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
    media: [
      {
        type: { type: String, enum: ['image', 'video'] },
        url: String,
        publicId: String,
        thumbnail: String,
      },
    ],
    caption: { type: String, default: '', maxlength: 1000 },
    location: {
      name: { type: String, default: '' },
      lat: Number,
      lng: Number,
    },
    mood: { type: String, default: '' },
    weather: { type: String, default: '' },
    people: [{ type: String, trim: true }],
    date: { type: Date, default: Date.now },
    favoriteSong: {
      title: { type: String, default: '' },
      artist: { type: String, default: '' },
      spotifyUri: { type: String, default: '' },
    },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

memorySchema.index({ coupleId: 1, date: -1 });

module.exports = mongoose.model('Memory', memorySchema);
