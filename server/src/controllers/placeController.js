const Place = require('../models/Place');
const { uploadToCloudinary } = require('../utils/upload');

const createPlace = async (req, res, next) => {
  try {
    const { name, category, icon, lat, lng, address, description, visitDate, rating } = req.body;

    const place = await Place.create({
      coupleId: req.couple._id,
      createdBy: req.user._id,
      name, category, icon, address, description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      visitDate: visitDate || Date.now(),
      rating: rating || 5,
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const result = await uploadToCloudinary(file.buffer, 'places', type === 'video' ? 'video' : 'image');
        place.media.push({ type, url: result.url, publicId: result.publicId });
      }
      await place.save();
    }

    res.status(201).json({ success: true, message: 'Place added! 📍', data: { place } });
  } catch (error) {
    next(error);
  }
};

const getPlaces = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { coupleId: req.couple._id };
    if (category) query.category = category;

    const places = await Place.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ visitDate: -1 });

    res.json({ success: true, data: { places } });
  } catch (error) {
    next(error);
  }
};

const getNearby = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 50000 } = req.query;

    const places = await Place.find({
      coupleId: req.couple._id,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).populate('createdBy', 'name avatar');

    res.json({ success: true, data: { places } });
  } catch (error) {
    next(error);
  }
};

const getPlace = async (req, res, next) => {
  try {
    const place = await Place.findOne({ _id: req.params.id, coupleId: req.couple._id })
      .populate('createdBy', 'name avatar');
    if (!place) return res.status(404).json({ success: false, message: 'Place not found.' });
    res.json({ success: true, data: { place } });
  } catch (error) {
    next(error);
  }
};

const updatePlace = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.lat && updates.lng) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(updates.lng), parseFloat(updates.lat)],
      };
      delete updates.lat;
      delete updates.lng;
    }

    const place = await Place.findOneAndUpdate(
      { _id: req.params.id, coupleId: req.couple._id },
      updates, { new: true }
    );
    if (!place) return res.status(404).json({ success: false, message: 'Place not found.' });
    res.json({ success: true, data: { place } });
  } catch (error) {
    next(error);
  }
};

const deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findOneAndDelete({ _id: req.params.id, coupleId: req.couple._id });
    if (!place) return res.status(404).json({ success: false, message: 'Place not found.' });
    res.json({ success: true, message: 'Place deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPlace, getPlaces, getNearby, getPlace, updatePlace, deletePlace };
