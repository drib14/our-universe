const Surprise = require('../models/Surprise');
const { uploadToCloudinary } = require('../utils/upload');

const createSurprise = async (req, res, next) => {
  try {
    const { category, title, content, coupon } = req.body;

    const surprise = await Surprise.create({
      coupleId: req.couple._id,
      createdBy: req.user._id,
      category,
      title,
      content,
      coupon: coupon ? JSON.parse(coupon) : undefined,
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        let type = 'photo';
        let resourceType = 'image';
        if (file.mimetype.startsWith('audio/')) { type = 'voice'; resourceType = 'video'; }
        else if (file.mimetype.startsWith('video/')) { type = 'photo'; resourceType = 'video'; }

        const result = await uploadToCloudinary(file.buffer, 'surprises', resourceType);
        surprise.attachments.push({ type, url: result.url, publicId: result.publicId });
      }
      await surprise.save();
    }

    res.status(201).json({ success: true, message: 'Surprise created! 🎁', data: { surprise } });
  } catch (error) {
    next(error);
  }
};

const getSurprises = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = {
      coupleId: req.couple._id,
      createdBy: { $ne: req.user._id }, // Only show surprises from partner
    };
    if (category) query.category = category;

    const surprises = await Surprise.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { surprises } });
  } catch (error) {
    next(error);
  }
};

const getMySurprises = async (req, res, next) => {
  try {
    const surprises = await Surprise.find({
      coupleId: req.couple._id,
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: { surprises } });
  } catch (error) {
    next(error);
  }
};

const openSurprise = async (req, res, next) => {
  try {
    const surprise = await Surprise.findOne({
      _id: req.params.id,
      coupleId: req.couple._id,
      createdBy: { $ne: req.user._id },
    }).populate('createdBy', 'name avatar');

    if (!surprise) return res.status(404).json({ success: false, message: 'Surprise not found.' });

    if (!surprise.isOpened) {
      surprise.isOpened = true;
      surprise.openedAt = new Date();
      await surprise.save();
    }

    res.json({ success: true, data: { surprise } });
  } catch (error) {
    next(error);
  }
};

const redeemCoupon = async (req, res, next) => {
  try {
    const surprise = await Surprise.findOne({
      _id: req.params.id,
      coupleId: req.couple._id,
    });

    if (!surprise) return res.status(404).json({ success: false, message: 'Surprise not found.' });
    if (!surprise.coupon || surprise.coupon.isRedeemed) {
      return res.status(400).json({ success: false, message: 'Coupon already redeemed or not available.' });
    }

    surprise.coupon.isRedeemed = true;
    surprise.coupon.redeemedAt = new Date();
    await surprise.save();

    res.json({ success: true, message: 'Coupon redeemed! 🎉', data: { surprise } });
  } catch (error) {
    next(error);
  }
};

const deleteSurprise = async (req, res, next) => {
  try {
    const surprise = await Surprise.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!surprise) return res.status(404).json({ success: false, message: 'Surprise not found.' });
    res.json({ success: true, message: 'Surprise deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSurprise, getSurprises, getMySurprises, openSurprise, redeemCoupon, deleteSurprise };
