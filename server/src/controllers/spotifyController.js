const SpotifyWebApi = require('spotify-web-api-node');
const SharedPlaylist = require('../models/SharedPlaylist');
const User = require('../models/User');

const getSpotifyApi = () => {
  return new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });
};

// Get Spotify auth URL
const getAuthUrl = async (req, res, next) => {
  try {
    const spotifyApi = getSpotifyApi();
    const scopes = ['user-read-playback-state', 'user-read-currently-playing', 'playlist-modify-public', 'playlist-modify-private'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, req.user._id.toString());
    res.json({ success: true, data: { url: authorizeURL } });
  } catch (error) {
    next(error);
  }
};

// Spotify OAuth callback
const authCallback = async (req, res, next) => {
  try {
    const { code, state: userId } = req.query;
    const spotifyApi = getSpotifyApi();

    const data = await spotifyApi.authorizationCodeGrant(code);
    await User.findByIdAndUpdate(userId, {
      spotifyAccessToken: data.body['access_token'],
      spotifyRefreshToken: data.body['refresh_token'],
    });

    res.send('<html><body><h2>Spotify connected! You can close this window.</h2></body></html>');
  } catch (error) {
    next(error);
  }
};

// Search Spotify tracks (client credentials — no user login needed)
const searchTracks = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const spotifyApi = getSpotifyApi();

    // Use client credentials flow for search
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body['access_token']);

    const results = await spotifyApi.searchTracks(q, { limit: parseInt(limit) });

    const tracks = results.body.tracks.items.map((t) => ({
      spotifyId: t.id,
      title: t.name,
      artist: t.artists.map((a) => a.name).join(', '),
      albumArt: t.album.images[0]?.url || '',
      spotifyUri: t.uri,
      previewUrl: t.preview_url || '',
      duration: t.duration_ms,
    }));

    res.json({ success: true, data: { tracks } });
  } catch (error) {
    next(error);
  }
};

// Get shared playlist
const getPlaylist = async (req, res, next) => {
  try {
    let playlist = await SharedPlaylist.findOne({ coupleId: req.couple._id })
      .populate('songs.addedBy', 'name avatar');

    if (!playlist) {
      playlist = await SharedPlaylist.create({ coupleId: req.couple._id, songs: [] });
    }

    res.json({ success: true, data: { playlist } });
  } catch (error) {
    next(error);
  }
};

// Add song to playlist
const addSong = async (req, res, next) => {
  try {
    const { title, artist, albumArt, spotifyUri, spotifyId, previewUrl, note, isOurSong } = req.body;

    let playlist = await SharedPlaylist.findOne({ coupleId: req.couple._id });
    if (!playlist) {
      playlist = await SharedPlaylist.create({ coupleId: req.couple._id, songs: [] });
    }

    // If marking as "Our Song", unmark any existing
    if (isOurSong) {
      playlist.songs.forEach((s) => (s.isOurSong = false));
    }

    playlist.songs.push({
      title, artist, albumArt, spotifyUri, spotifyId, previewUrl,
      addedBy: req.user._id,
      note: note || '',
      isOurSong: isOurSong || false,
    });

    await playlist.save();

    res.json({ success: true, message: '🎵 Song added!', data: { playlist } });
  } catch (error) {
    next(error);
  }
};

// Remove song
const removeSong = async (req, res, next) => {
  try {
    const playlist = await SharedPlaylist.findOne({ coupleId: req.couple._id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found.' });

    playlist.songs = playlist.songs.filter((s) => s._id.toString() !== req.params.songId);
    await playlist.save();

    res.json({ success: true, message: 'Song removed.', data: { playlist } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuthUrl, authCallback, searchTracks, getPlaylist, addSong, removeSong };
