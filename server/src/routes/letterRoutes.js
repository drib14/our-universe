const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const { upload } = require('../utils/upload');
const ctrl = require('../controllers/letterController');

router.use(auth, requireCouple);

router.post('/', [body('title').trim().notEmpty(), body('unlockDate').isISO8601()], ctrl.createLetter);
router.get('/', ctrl.getLetters);
router.get('/:id', ctrl.getLetter);
router.put('/:id', ctrl.updateLetter);
router.delete('/:id', ctrl.deleteLetter);
router.post('/:id/seal', ctrl.sealLetter);
router.post('/:id/react', [body('emoji').notEmpty()], ctrl.reactToLetter);
router.post('/:id/read', ctrl.markAsRead);
router.post('/:id/archive', ctrl.archiveLetter);
router.post('/:id/attachments', upload.array('files', 10), ctrl.addAttachment);

module.exports = router;
