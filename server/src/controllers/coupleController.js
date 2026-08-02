const User = require('../models/User');
const Couple = require('../models/Couple');
const { generatePairCode } = require('../utils/tokens');
const { sendEmail, emailTemplates } = require('../config/email');
const QRCode = require('qrcode');

/**
 * GET /api/couple/pair-code
 */
const getPairCode = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.pairCode) {
      user.pairCode = generatePairCode();
      await user.save();
    }

    res.json({
      success: true,
      data: { pairCode: user.pairCode },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/couple/qr-code
 */
const getQRCode = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.pairCode) {
      user.pairCode = generatePairCode();
      await user.save();
    }

    const qrPayload = JSON.stringify({
      type: 'pairly_pair',
      code: user.pairCode,
      name: user.name,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#880e4f',
        light: '#fce4ec',
      },
    });

    res.json({
      success: true,
      data: {
        qrCode: qrDataUrl,
        pairCode: user.pairCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/couple/pair
 * Pair with partner using invite code
 */
const pairWithCode = async (req, res, next) => {
  try {
    const rawCode = req.body.code || req.body.pairCode;
    if (!rawCode) {
      return res.status(400).json({
        success: false,
        message: 'Pairing code is required.',
      });
    }

    const code = rawCode.trim().toUpperCase();
    const user = req.user;

    if (user.coupleId) {
      return res.status(400).json({
        success: false,
        message: 'You are already paired with someone.',
      });
    }

    const partner = await User.findOne({ pairCode: code });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Invalid pairing code. Please check and try again.',
      });
    }

    if (partner._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You can't pair with yourself!",
      });
    }

    if (partner.coupleId) {
      return res.status(400).json({
        success: false,
        message: 'This person is already paired with someone.',
      });
    }

    const couple = await Couple.create({
      partner1: user._id,
      partner2: partner._id,
    });

    await User.findByIdAndUpdate(user._id, {
      partnerId: partner._id,
      coupleId: couple._id,
    });
    await User.findByIdAndUpdate(partner._id, {
      partnerId: user._id,
      coupleId: couple._id,
    });

    const populatedCouple = await Couple.findById(couple._id)
      .populate('partner1', 'name avatar email')
      .populate('partner2', 'name avatar email');

    res.status(201).json({
      success: true,
      message: `You're now connected with ${partner.name}!`,
      data: { couple: populatedCouple, partner },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/couple/invite
 * Send email invite to partner
 */
const sendInvite = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = req.user;

    if (!email || typeof email !== 'string' || !email.trim().includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (user.coupleId) {
      return res.status(400).json({
        success: false,
        message: 'You are already paired with someone.',
      });
    }

    if (!user.pairCode) {
      user.pairCode = generatePairCode();
      await user.save();
    }

    const template = emailTemplates.partnerInvite(user.name, user.pairCode);
    await sendEmail(cleanEmail, template.subject, template.html);

    res.json({
      success: true,
      message: 'Invitation email sent successfully!',
      data: { pairCode: user.pairCode },
    });
  } catch (error) {
    console.error('Send invite error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send invitation.',
    });
  }
};

/**
 * GET /api/couple
 */
const getCouple = async (req, res, next) => {
  try {
    if (!req.user.coupleId) {
      return res.json({
        success: true,
        data: { couple: null, partner: null, isPaired: false },
      });
    }

    const couple = await Couple.findById(req.user.coupleId)
      .populate('partner1', 'name avatar email birthday bio pairCode')
      .populate('partner2', 'name avatar email birthday bio pairCode');

    if (!couple) {
      return res.json({
        success: true,
        data: { couple: null, partner: null, isPaired: false },
      });
    }

    // Determine partner user object
    const partner =
      couple.partner1 && couple.partner1._id.toString() === req.user._id.toString()
        ? couple.partner2
        : couple.partner1;

    res.json({
      success: true,
      data: { couple, partner, isPaired: true },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/couple
 */
const updateCouple = async (req, res, next) => {
  try {
    const { anniversaryDate, coupleNickname } = req.body;
    const updates = {};

    if (anniversaryDate) updates.anniversaryDate = anniversaryDate;
    if (coupleNickname !== undefined) updates.coupleNickname = coupleNickname;

    const couple = await Couple.findByIdAndUpdate(req.user.coupleId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('partner1', 'name avatar email')
      .populate('partner2', 'name avatar email');

    res.json({
      success: true,
      message: 'Couple updated!',
      data: { couple },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/couple/unpair
 */
const unpair = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.coupleId) {
      return res.status(400).json({
        success: false,
        message: 'You are not paired with anyone.',
      });
    }

    const couple = await Couple.findById(user.coupleId);

    if (couple) {
      await User.findByIdAndUpdate(couple.partner1, {
        partnerId: null,
        coupleId: null,
        pairCode: generatePairCode(),
      });
      await User.findByIdAndUpdate(couple.partner2, {
        partnerId: null,
        coupleId: null,
        pairCode: generatePairCode(),
      });

      await Couple.findByIdAndDelete(couple._id);
    }

    res.json({
      success: true,
      message: 'Unpaired successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPairCode,
  getQRCode,
  pairWithCode,
  sendInvite,
  getCouple,
  updateCouple,
  unpair,
};
