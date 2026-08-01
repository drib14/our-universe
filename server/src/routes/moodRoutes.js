const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const ctrl = require('../controllers/moodController');

router.use(auth, requireCouple);

router.post('/', [body('mood').isInt({ min: 1, max: 5 })], ctrl.checkIn);
router.get('/', ctrl.getMoods);
router.get('/stats', ctrl.getStats);

module.exports = router;
