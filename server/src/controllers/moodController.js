const MoodEntry = require('../models/MoodEntry');

const MOOD_EMOJIS = { 1: '😭', 2: '😔', 3: '😐', 4: '😊', 5: '😁' };

const checkIn = async (req, res, next) => {
  try {
    const { mood, note } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Upsert — one mood per user per day
    const entry = await MoodEntry.findOneAndUpdate(
      { userId: req.user._id, date: today },
      { mood, note, coupleId: req.couple._id },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Mood logged! ${MOOD_EMOJIS[mood]}`,
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

const getMoods = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = { coupleId: req.couple._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (userId) {
      query.userId = userId;
    }

    const moods = await MoodEntry.find(query)
      .populate('userId', 'name avatar')
      .sort({ date: -1 });

    res.json({ success: true, data: { moods } });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const coupleId = req.couple._id;

    // Get moods for both users
    const query = { coupleId };
    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      query.date = { $gte: startDate, $lt: endDate };
    }

    const moods = await MoodEntry.find(query)
      .populate('userId', 'name avatar')
      .sort({ date: 1 });

    // Calculate stats per user
    const userMoods = {};
    for (const m of moods) {
      const uid = m.userId._id.toString();
      if (!userMoods[uid]) {
        userMoods[uid] = { user: m.userId, entries: [], moodCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }
      userMoods[uid].entries.push(m);
      userMoods[uid].moodCounts[m.mood]++;
    }

    // Calculate streaks and most common mood
    const stats = Object.values(userMoods).map(({ user, entries, moodCounts }) => {
      // Happy streak (mood >= 4)
      let currentStreak = 0;
      let longestStreak = 0;
      for (const e of entries) {
        if (e.mood >= 4) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      const mostCommonMood = Object.entries(moodCounts)
        .sort(([, a], [, b]) => b - a)[0];

      return {
        user,
        totalEntries: entries.length,
        moodCounts,
        longestHappyStreak: longestStreak,
        mostCommonMood: mostCommonMood ? { mood: parseInt(mostCommonMood[0]), emoji: MOOD_EMOJIS[mostCommonMood[0]], count: mostCommonMood[1] } : null,
        averageMood: entries.length > 0 ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1) : 0,
      };
    });

    res.json({ success: true, data: { stats, moods } });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkIn, getMoods, getStats };
