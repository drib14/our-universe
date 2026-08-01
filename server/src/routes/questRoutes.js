const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const ctrl = require('../controllers/questController');

router.use(auth, requireCouple);

router.post('/generate', ctrl.generateWeeklyQuest);
router.get('/', ctrl.getQuests);
router.post('/:id/complete-task', ctrl.completeTask);
router.get('/stats', ctrl.getStats);

module.exports = router;
