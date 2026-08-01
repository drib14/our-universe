const Memory = require('../models/Memory');
const { uploadToCloudinary } = require('../utils/upload');

const createMemory = async (req, res, next) => {
  try {
    const { caption, location, mood, weather, people, date, favoriteSong } = req.body;

    const memory = await Memory.create({
      coupleId: req.couple._id,
      createdBy: req.user._id,
      caption,
      location: location ? JSON.parse(location) : undefined,
      mood, weather,
      people: people ? JSON.parse(people) : [],
      date: date || Date.now(),
      favoriteSong: favoriteSong ? JSON.parse(favoriteSong) : undefined,
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const result = await uploadToCloudinary(file.buffer, 'memories', type === 'video' ? 'video' : 'image');
        memory.media.push({ type, url: result.url, publicId: result.publicId });
      }
      await memory.save();
    }

    res.status(201).json({ success: true, message: 'Memory saved! 📸', data: { memory } });
  } catch (error) {
    next(error);
  }
};

const getMemories = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, favorites } = req.query;
    const query = { coupleId: req.couple._id };
    if (favorites === 'true') query.isFavorite = true;

    const memories = await Memory.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ date: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Memory.countDocuments(query);

    res.json({ success: true, data: { memories, total } });
  } catch (error) {
    next(error);
  }
};

const getOnThisDay = async (req, res, next) => {
  try {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();

    const memories = await Memory.find({ coupleId: req.couple._id })
      .populate('createdBy', 'name avatar');

    // Filter for matching month/day in previous years
    const onThisDay = memories.filter((m) => {
      const d = new Date(m.date);
      return d.getMonth() === month && d.getDate() === day && d.getFullYear() < today.getFullYear();
    });

    res.json({ success: true, data: { memories: onThisDay } });
  } catch (error) {
    next(error);
  }
};

const getMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, coupleId: req.couple._id })
      .populate('createdBy', 'name avatar');
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });
    res.json({ success: true, data: { memory } });
  } catch (error) {
    next(error);
  }
};

const updateMemory = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.location) updates.location = JSON.parse(updates.location);
    if (updates.people) updates.people = JSON.parse(updates.people);
    if (updates.favoriteSong) updates.favoriteSong = JSON.parse(updates.favoriteSong);

    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, coupleId: req.couple._id },
      updates, { new: true }
    );
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });
    res.json({ success: true, data: { memory } });
  } catch (error) {
    next(error);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, coupleId: req.couple._id });
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });
    memory.isFavorite = !memory.isFavorite;
    await memory.save();
    res.json({ success: true, data: { isFavorite: memory.isFavorite } });
  } catch (error) {
    next(error);
  }
};

const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findOneAndDelete({ _id: req.params.id, coupleId: req.couple._id });
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found.' });
    res.json({ success: true, message: 'Memory deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMemory, getMemories, getOnThisDay, getMemory, updateMemory, toggleFavorite, deleteMemory };
