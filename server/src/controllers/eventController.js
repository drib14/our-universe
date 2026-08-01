const Event = require('../models/Event');

const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      coupleId: req.couple._id,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { coupleId: req.couple._id };

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ date: 1 });

    res.json({ success: true, data: { events } });
  } catch (error) {
    next(error);
  }
};

const getUpcoming = async (req, res, next) => {
  try {
    const events = await Event.find({
      coupleId: req.couple._id,
      date: { $gte: new Date() },
    })
      .populate('createdBy', 'name avatar')
      .sort({ date: 1 })
      .limit(10);

    // Calculate countdowns
    const withCountdown = events.map((e) => {
      const diff = new Date(e.date) - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return { ...e.toJSON(), daysUntil: days };
    });

    res.json({ success: true, data: { events: withCountdown } });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, coupleId: req.couple._id },
      req.body, { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, coupleId: req.couple._id });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, getEvents, getUpcoming, updateEvent, deleteEvent };
