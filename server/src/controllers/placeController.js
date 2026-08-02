const Place = require('../models/Place');
const { uploadToCloudinary } = require('../utils/upload');

const createPlace = async (req, res, next) => {
  try {
    const { name, category, icon, lat, lng, location, address, description, visitDate, rating } = req.body;

    let coordinates = [0, 0];
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      coordinates = [parseFloat(location.coordinates[0]) || 0, parseFloat(location.coordinates[1]) || 0];
    } else if (lat !== undefined && lng !== undefined) {
      coordinates = [parseFloat(lng) || 0, parseFloat(lat) || 0];
    }

    const place = await Place.create({
      coupleId: req.couple._id,
      createdBy: req.user._id,
      name,
      category: category || 'custom',
      icon: icon || '📍',
      address: address || '',
      description: description || '',
      location: {
        type: 'Point',
        coordinates,
      },
      visitDate: visitDate || Date.now(),
      rating: Number(rating) || 5,
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const result = await uploadToCloudinary(file.buffer, 'places', type === 'video' ? 'video' : 'image');
        place.media.push({ type, url: result.url, publicId: result.publicId });
      }
      await place.save();
    }

    res.status(201).json({ success: true, message: 'Place added!', data: { place } });
  } catch (error) {
    next(error);
  }
};

const searchLocation = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, data: { results: [] } });
    }

    const token = process.env.LOCATIONIQ_ACCESS_TOKEN;
    if (!token) {
      console.error('[LocationIQ Error] LOCATIONIQ_ACCESS_TOKEN is missing in environment variables.');
      return res.status(400).json({
        success: false,
        message: 'LOCATIONIQ_ACCESS_TOKEN environment variable is not configured.',
      });
    }

    const cleanQuery = q.trim();
    let items = [];

    // 1. Try LocationIQ Autocomplete API with POI & landmark tags
    try {
      const autoRes = await fetch(
        `https://us1.locationiq.com/v1/autocomplete.php?key=${token}&q=${encodeURIComponent(cleanQuery)}&limit=10&normalizecity=1&tag=tourism:*,amenity:*,historic:*,leisure:*`
      );
      if (autoRes.ok) {
        items = await autoRes.json();
      }
    } catch (e) {}

    // 2. LocationIQ Search API with extratags and landmark address details
    if (!Array.isArray(items) || items.length === 0) {
      try {
        const searchRes = await fetch(
          `https://us1.locationiq.com/v1/search.php?key=${token}&q=${encodeURIComponent(cleanQuery)}&format=json&limit=10&addressdetails=1&extratags=1&namedetails=1&dedupe=1`
        );
        if (searchRes.ok) {
          items = await searchRes.json();
        }
      } catch (e) {}
    }

    const results = (Array.isArray(items) ? items : []).map((item) => ({
      name: item.display_name ? item.display_name.split(',')[0].trim() : (item.name || cleanQuery),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.display_name || cleanQuery,
    }));

    res.json({ success: true, data: { results } });
  } catch (error) {
    console.error('[LocationIQ Exception]', error.message);
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

module.exports = { createPlace, searchLocation, getPlaces, getNearby, getPlace, updatePlace, deletePlace };
