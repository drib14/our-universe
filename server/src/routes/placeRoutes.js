const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const { upload } = require('../utils/upload');
const ctrl = require('../controllers/placeController');

router.use(auth, requireCouple);

router.post('/', upload.array('media', 10), ctrl.createPlace);
router.get('/', ctrl.getPlaces);
router.get('/nearby', ctrl.getNearby);
router.get('/search-location', ctrl.searchLocation);
router.get('/:id', ctrl.getPlace);
router.put('/:id', ctrl.updatePlace);
router.delete('/:id', ctrl.deletePlace);

module.exports = router;
