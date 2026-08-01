const Quest = require('../models/Quest');
const Couple = require('../models/Couple');

const QUEST_POOL = [
  { title: '🎬 Movie Night', tasks: ['Pick a movie together', 'Make popcorn', 'Watch the movie', 'Rate it 1-5 hearts'] },
  { title: '☕ Coffee Date', tasks: ['Visit a new coffee shop', 'Try each other\'s drink', 'Take a selfie together'] },
  { title: '🚶 Walk Together', tasks: ['Go for a 30-min walk', 'Hold hands', 'Talk about your day', 'Take a photo of something beautiful'] },
  { title: '🍳 Cook Together', tasks: ['Pick a recipe', 'Shop for ingredients', 'Cook the meal together', 'Enjoy dinner together'] },
  { title: '📸 Photo Challenge', tasks: ['Take a silly selfie', 'Take a romantic photo', 'Take a photo of your favorite spot', 'Post one to Memories'] },
  { title: '💌 Love Notes', tasks: ['Write a love note', 'Hide it for your partner', 'Read your partner\'s note', 'Save it as a memory'] },
  { title: '🎮 Game Night', tasks: ['Choose a game', 'Play together for 30 min', 'Loser gives winner a hug'] },
  { title: '🌅 Sunset Watch', tasks: ['Find a sunset spot', 'Watch the sunset together', 'Take a photo', 'Share your favorite moment'] },
  { title: '📚 Read Together', tasks: ['Pick a book or article', 'Read for 20 minutes', 'Discuss what you read'] },
  { title: '🎵 Music Session', tasks: ['Create a playlist together', 'Listen to each other\'s favorite song', 'Dance together'] },
  { title: '🧘 Wellness Day', tasks: ['Do a workout together', 'Try meditation for 10 min', 'Give each other a massage'] },
  { title: '🎨 Creative Hour', tasks: ['Draw each other', 'Share your drawings', 'Frame the best one'] },
];

const generateWeeklyQuest = async (req, res, next) => {
  try {
    const coupleId = req.couple._id;

    // Check if there's already an active weekly quest
    const existingQuest = await Quest.findOne({ coupleId, type: 'weekly', status: 'active' });
    if (existingQuest) {
      return res.json({ success: true, data: { quest: existingQuest }, message: 'Active quest already exists.' });
    }

    // Pick a random quest from pool
    const template = QUEST_POOL[Math.floor(Math.random() * QUEST_POOL.length)];
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const quest = await Quest.create({
      coupleId,
      title: template.title,
      tasks: template.tasks.map((t) => ({ title: t })),
      heartReward: 50,
      type: 'weekly',
      weekStart: now,
      weekEnd,
    });

    res.status(201).json({ success: true, message: 'New weekly quest generated! 🎮', data: { quest } });
  } catch (error) {
    next(error);
  }
};

const getQuests = async (req, res, next) => {
  try {
    const { status = 'active' } = req.query;
    const quests = await Quest.find({ coupleId: req.couple._id, status })
      .populate('tasks.completedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { quests } });
  } catch (error) {
    next(error);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const { taskIndex } = req.body;
    const quest = await Quest.findOne({ _id: req.params.id, coupleId: req.couple._id });

    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found.' });
    if (quest.status !== 'active') return res.status(400).json({ success: false, message: 'Quest is not active.' });

    const task = quest.tasks[taskIndex];
    if (!task) return res.status(400).json({ success: false, message: 'Invalid task index.' });

    task.isCompleted = !task.isCompleted;
    task.completedBy = task.isCompleted ? req.user._id : null;
    task.completedAt = task.isCompleted ? new Date() : null;

    // Check if all tasks are complete
    const allComplete = quest.tasks.every((t) => t.isCompleted);
    if (allComplete) {
      quest.status = 'completed';

      // Award hearts
      const couple = await Couple.findById(req.couple._id);
      couple.stats.totalHearts += quest.heartReward;
      couple.stats.completedQuests += 1;
      couple.stats.xp += quest.heartReward;

      // Level up: every 200 XP
      const newLevel = Math.floor(couple.stats.xp / 200) + 1;
      couple.stats.level = newLevel;

      await couple.save();
    }

    await quest.save();

    res.json({
      success: true,
      message: allComplete ? `Quest completed! +${quest.heartReward} hearts! 🎉` : 'Task updated!',
      data: { quest, allComplete },
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const couple = await Couple.findById(req.couple._id);
    res.json({
      success: true,
      data: {
        stats: couple.stats,
        levelProgress: (couple.stats.xp % 200) / 200,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateWeeklyQuest, getQuests, completeTask, getStats };
