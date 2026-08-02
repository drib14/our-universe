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

// Search music tracks (Spotify Web API with resilient iTunes API fallback for guaranteed 30s previews)
const searchTracks = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, data: { tracks: [] } });
    }

    let tracks = [];

    // Attempt 1: Try Spotify Web API if client credentials exist in environment
    if (
      process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_CLIENT_ID !== 'your_spotify_client_id'
    ) {
      try {
        const spotifyApi = getSpotifyApi();
        const authData = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(authData.body['access_token']);

        const results = await spotifyApi.searchTracks(q, { limit: parseInt(limit) });
        if (results.body?.tracks?.items) {
          tracks = results.body.tracks.items.map((t) => ({
            spotifyId: t.id,
            title: t.name,
            artist: t.artists.map((a) => a.name).join(', '),
            albumArt: t.album.images[0]?.url || '',
            spotifyUri: t.uri,
            previewUrl: t.preview_url || '',
            duration: t.duration_ms,
          }));
        }
      } catch (spotifyErr) {
        // Fall back to iTunes
      }
    }

    // Attempt 2: Universal iTunes Search API (Guaranteed 30s audio previews & zero API key requirement)
    if (tracks.length === 0 || tracks.every((t) => !t.previewUrl)) {
      try {
        const iTunesRes = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(q.trim())}&media=music&entity=song&limit=${limit}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'application/json',
            },
          }
        );

        if (iTunesRes.ok) {
          const data = await iTunesRes.json();
          if (data.results && data.results.length > 0) {
            const iTunesTracks = data.results.map((t) => ({
              spotifyId: String(t.trackId),
              title: t.trackName,
              artist: t.artistName,
              albumArt: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : '',
              spotifyUri: t.trackViewUrl || '',
              previewUrl: t.previewUrl || '',
              duration: t.trackTimeMillis || 0,
            }));

            // If Spotify returned tracks without previews, merge iTunes preview URLs
            if (tracks.length > 0) {
              tracks = tracks.map((spTrack, i) => ({
                ...spTrack,
                previewUrl: spTrack.previewUrl || iTunesTracks[i]?.previewUrl || '',
              }));
            } else {
              tracks = iTunesTracks;
            }
          }
        }
      } catch (iTunesErr) {
        console.error('[Spotify] iTunes Search fetch error:', iTunesErr.message);
      }
    }

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
    const { title, artist, albumArt, spotifyUri, spotifyId, previewUrl, note, startTime, isOurSong } = req.body;

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
      startTime: Number(startTime) || 0,
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
