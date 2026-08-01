const express = require('express');
const router = express.Router();
const {
  getPairCode,
  getQRCode,
  pairWithCode,
  sendInvite,
  getCouple,
  updateCouple,
  unpair,
} = require('../controllers/coupleController');
const { auth } = require('../middleware/auth');
const { requireCouple } = require('../middleware/couple');

// All routes require auth
router.use(auth);

// Pairing routes (before couple is formed)
router.get('/pair-code', getPairCode);
router.get('/qr-code', getQRCode);

router.post('/pair', pairWithCode);
router.post('/invite', sendInvite);

// Couple routes (after paired)
router.get('/', getCouple);
router.put('/', requireCouple, updateCouple);
router.delete('/unpair', requireCouple, unpair);

module.exports = router;
