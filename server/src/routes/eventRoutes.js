const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const ctrl = require('../controllers/eventController');

router.use(auth, requireCouple);

router.post('/', ctrl.createEvent);
router.get('/', ctrl.getEvents);
router.get('/upcoming', ctrl.getUpcoming);
router.put('/:id', ctrl.updateEvent);
router.delete('/:id', ctrl.deleteEvent);

module.exports = router;
