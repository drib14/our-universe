const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const { upload } = require('../utils/upload');
const ctrl = require('../controllers/chatController');

router.use(auth, requireCouple);

router.get('/', ctrl.getMessages);
router.post('/', upload.single('media'), ctrl.sendMessage);
router.post('/read', ctrl.markRead);
router.post('/:id/react', ctrl.reactToMessage);

module.exports = router;
