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
    if (!q) {
      return res.json({ success: true, data: { results: [] } });
    }

    const token = process.env.LOCATIONIQ_ACCESS_TOKEN;
    let results = [];

    if (token && token !== 'your_locationiq_access_token') {
      try {
        const response = await fetch(
          `https://us1.locationiq.com/v1/search.php?key=${token}&q=${encodeURIComponent(q)}&format=json&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          results = data.map((item) => ({
            name: item.display_name.split(',')[0],
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: item.display_name,
          }));
        }
      } catch (err) {
        console.error('LocationIQ fetch error:', err.message);
      }
    }

    if (results.length === 0) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
          { headers: { 'User-Agent': 'PairlyApp/1.0' } }
        );
        if (response.ok) {
          const data = await response.json();
          results = data.map((item) => ({
            name: item.display_name.split(',')[0],
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: item.display_name,
          }));
        }
      } catch (err) {
        console.error('Nominatim fetch error:', err.message);
      }
    }

    res.json({ success: true, data: { results } });
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

module.exports = { createPlace, searchLocation, getPlaces, getNearby, getPlace, updatePlace, deletePlace };
