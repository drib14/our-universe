const mongoose = require('mongoose');

const sharedPlaylistSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
      unique: true,
    },
    songs: [
      {
        title: { type: String, required: true },
        artist: { type: String, required: true },
        albumArt: { type: String, default: '' },
        spotifyUri: { type: String, default: '' },
        spotifyId: { type: String, default: '' },
        previewUrl: { type: String, default: '' },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
        note: { type: String, default: '', maxlength: 200 },
        startTime: { type: Number, default: 0 },
        isOurSong: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SharedPlaylist', sharedPlaylistSchema);
