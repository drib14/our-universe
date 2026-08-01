const Message = require('../models/Message');
const { uploadToCloudinary } = require('../utils/upload');

const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ coupleId: req.couple._id })
      .populate('senderId', 'name avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ coupleId: req.couple._id });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Oldest first for display
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      },
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { content, type = 'text', replyTo } = req.body;

    const messageData = {
      coupleId: req.couple._id,
      senderId: req.user._id,
      content,
      type,
      replyTo: replyTo || null,
    };

    // Handle media upload
    if (req.file) {
      let resourceType = 'image';
      if (req.file.mimetype.startsWith('audio/')) resourceType = 'video';
      else if (req.file.mimetype.startsWith('video/')) resourceType = 'video';

      const result = await uploadToCloudinary(req.file.buffer, 'chat', resourceType);
      messageData.mediaUrl = result.url;
      messageData.mediaPublicId = result.publicId;

      if (req.file.mimetype.startsWith('audio/')) messageData.type = 'voice';
      else if (req.file.mimetype.startsWith('image/')) messageData.type = 'image';
    }

    const message = await Message.create(messageData);
    const populated = await Message.findById(message._id)
      .populate('senderId', 'name avatar')
      .populate('replyTo');

    res.status(201).json({ success: true, data: { message: populated } });
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      {
        coupleId: req.couple._id,
        senderId: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const reactToMessage = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findOne({ _id: req.params.id, coupleId: req.couple._id });

    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });

    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== req.user._id.toString()
    );
    if (emoji) message.reactions.push({ userId: req.user._id, emoji });
    await message.save();

    res.json({ success: true, data: { reactions: message.reactions } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage, markRead, reactToMessage };
