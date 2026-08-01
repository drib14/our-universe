const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const { upload } = require('../utils/upload');
const ctrl = require('../controllers/timelineController');

router.use(auth, requireCouple);

router.post('/', upload.array('media', 10), ctrl.createEvent);
router.get('/', ctrl.getEvents);
router.get('/:id', ctrl.getEvent);
router.put('/:id', upload.array('media', 10), ctrl.updateEvent);
router.delete('/:id', ctrl.deleteEvent);

module.exports = router;
