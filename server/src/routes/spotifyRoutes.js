const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const ctrl = require('../controllers/spotifyController');

// Public callback (no auth needed)
router.get('/callback', ctrl.authCallback);

router.use(auth);

router.get('/auth-url', ctrl.getAuthUrl);
router.get('/search', ctrl.searchTracks);

router.use(requireCouple);

router.get('/playlist', ctrl.getPlaylist);
router.post('/playlist/song', ctrl.addSong);
router.post('/playlist/songs', ctrl.addSong);
router.delete('/playlist/song/:songId', ctrl.removeSong);
router.delete('/playlist/songs/:songId', ctrl.removeSong);

module.exports = router;
