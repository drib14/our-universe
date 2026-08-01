const TimelineEvent = require('../models/TimelineEvent');
const { uploadToCloudinary } = require('../utils/upload');

const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, icon, category, location, tags, mood, weather, song, people } = req.body;

    const event = await TimelineEvent.create({
      coupleId: req.couple._id,
      createdBy: req.user._id,
      title, description, date, icon, category,
      location: location ? JSON.parse(location) : undefined,
      tags: tags ? JSON.parse(tags) : [],
      mood, weather,
      song: song ? JSON.parse(song) : undefined,
      people: people ? JSON.parse(people) : [],
    });

    // Handle media uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const result = await uploadToCloudinary(file.buffer, 'timeline', type === 'video' ? 'video' : 'image');
        event.media.push({ type, url: result.url, publicId: result.publicId });
      }
      await event.save();
    }

    res.status(201).json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const query = { coupleId: req.couple._id };
    if (category) query.category = category;

    const events = await TimelineEvent.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ date: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await TimelineEvent.countDocuments(query);

    res.json({ success: true, data: { events, total } });
  } catch (error) {
    next(error);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await TimelineEvent.findOne({
      _id: req.params.id,
      coupleId: req.couple._id,
    }).populate('createdBy', 'name avatar');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.location) updates.location = JSON.parse(updates.location);
    if (updates.tags) updates.tags = JSON.parse(updates.tags);
    if (updates.song) updates.song = JSON.parse(updates.song);
    if (updates.people) updates.people = JSON.parse(updates.people);

    const event = await TimelineEvent.findOneAndUpdate(
      { _id: req.params.id, coupleId: req.couple._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const result = await uploadToCloudinary(file.buffer, 'timeline', type === 'video' ? 'video' : 'image');
        event.media.push({ type, url: result.url, publicId: result.publicId });
      }
      await event.save();
    }

    res.json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await TimelineEvent.findOneAndDelete({
      _id: req.params.id,
      coupleId: req.couple._id,
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent };
