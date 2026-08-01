const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
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
    name: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      enum: ['first_date', 'restaurant', 'sunset', 'vacation', 'home', 'park', 'custom'],
      default: 'custom',
    },
    icon: { type: String, default: '📍' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    address: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 1000 },
    media: [
      {
        type: { type: String, enum: ['image', 'video'] },
        url: String,
        publicId: String,
      },
    ],
    visitDate: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { timestamps: true }
);

placeSchema.index({ location: '2dsphere' });
placeSchema.index({ coupleId: 1 });

module.exports = mongoose.model('Place', placeSchema);
