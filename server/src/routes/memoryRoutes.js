const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const { upload } = require('../utils/upload');
const ctrl = require('../controllers/memoryController');

router.use(auth, requireCouple);

router.post('/', upload.array('media', 10), ctrl.createMemory);
router.get('/', ctrl.getMemories);
router.get('/on-this-day', ctrl.getOnThisDay);
router.get('/:id', ctrl.getMemory);
router.put('/:id', ctrl.updateMemory);
router.put('/:id/favorite', ctrl.toggleFavorite);
router.delete('/:id', ctrl.deleteMemory);

module.exports = router;
