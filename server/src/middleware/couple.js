const Couple = require('../models/Couple');

/**
 * Couple middleware
 * Ensures the user is part of a couple and attaches couple data to request.
 * Must be used AFTER auth middleware.
 */
const requireCouple = async (req, res, next) => {
  try {
    if (!req.user.coupleId) {
      return res.status(403).json({
        success: false,
        message: 'You must be paired with a partner to access this feature.',
        code: 'NOT_PAIRED',
      });
    }

    const couple = await Couple.findById(req.user.coupleId)
      .populate('partner1', 'name avatar email')
      .populate('partner2', 'name avatar email');

    if (!couple || couple.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your couple account is not active.',
        code: 'COUPLE_INACTIVE',
      });
    }

    req.couple = couple;
    req.partner =
      couple.partner1._id.toString() === req.user._id.toString()
        ? couple.partner2
        : couple.partner1;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireCouple };
