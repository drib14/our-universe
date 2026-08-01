const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');
const { upload } = require('../utils/upload');
const ctrl = require('../controllers/surpriseController');

router.use(auth, requireCouple);

router.post('/', upload.array('files', 5), ctrl.createSurprise);
router.get('/', ctrl.getSurprises);
router.get('/mine', ctrl.getMySurprises);
router.post('/:id/open', ctrl.openSurprise);
router.post('/:id/redeem', ctrl.redeemCoupon);
router.delete('/:id', ctrl.deleteSurprise);

module.exports = router;
