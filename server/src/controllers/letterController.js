const Letter = require('../models/Letter');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/upload');

/**
 * POST /api/letters
 */
const createLetter = async (req, res, next) => {
  try {
    const { title, content, unlockDate } = req.body;

    if (new Date(unlockDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Unlock date must be in the future.',
      });
    }

    const letter = await Letter.create({
      senderId: req.user._id,
      receiverId: req.partner._id,
      coupleId: req.couple._id,
      title,
      content,
      unlockDate,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Letter draft saved!',
      data: { letter },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/letters
 */
const getLetters = async (req, res, next) => {
  try {
    const { filter = 'all', page = 1, limit = 20 } = req.query;
    const query = { coupleId: req.couple._id };

    switch (filter) {
      case 'sent':
        query.senderId = req.user._id;
        query.status = { $ne: 'draft' };
        break;
      case 'received':
        query.receiverId = req.user._id;
        query.status = { $ne: 'draft' };
        break;
      case 'drafts':
        query.senderId = req.user._id;
        query.status = 'draft';
        break;
      case 'archived':
        query.status = 'archived';
        break;
      case 'unlocked':
        query.receiverId = req.user._id;
        query.unlockDate = { $lte: new Date() };
        query.status = { $in: ['sealed', 'unlocked', 'read'] };
        break;
      default:
        // All non-draft letters for this couple
        query.$or = [
          { senderId: req.user._id },
          { receiverId: req.user._id, status: { $ne: 'draft' } },
        ];
        delete query.coupleId; // Let $or handle it
        query.$or.forEach((q) => (q.coupleId = req.couple._id));
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [letters, total] = await Promise.all([
      Letter.find(filter === 'all' ? { coupleId: req.couple._id, $or: [{ senderId: req.user._id }, { receiverId: req.user._id, status: { $ne: 'draft' } }] } : query)
        .populate('senderId', 'name avatar')
        .populate('receiverId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Letter.countDocuments(filter === 'all' ? { coupleId: req.couple._id, $or: [{ senderId: req.user._id }, { receiverId: req.user._id, status: { $ne: 'draft' } }] } : query),
    ]);

    // For sealed letters that aren't unlocked yet, hide content from receiver
    const sanitizedLetters = letters.map((letter) => {
      const l = letter.toJSON();
      if (
        l.receiverId._id.toString() === req.user._id.toString() &&
        !l.isUnlocked &&
        l.status === 'sealed'
      ) {
        l.content = '🔒 This letter is sealed until ' + new Date(l.unlockDate).toLocaleDateString();
        l.attachments = [];
      }
      return l;
    });

    res.json({
      success: true,
      data: {
        letters: sanitizedLetters,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/letters/:id
 */
const getLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      coupleId: req.couple._id,
    })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .populate('reactions.userId', 'name avatar');

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found.',
      });
    }

    const letterJSON = letter.toJSON();

    // If receiver tries to read a sealed, not-yet-unlocked letter
    if (
      letter.receiverId._id.toString() === req.user._id.toString() &&
      !letter.isUnlocked &&
      letter.status === 'sealed'
    ) {
      letterJSON.content = '🔒 Sealed until ' + new Date(letter.unlockDate).toLocaleDateString();
      letterJSON.attachments = [];
    }

    // Auto-update status to 'unlocked' if date has passed
    if (letter.status === 'sealed' && letter.isUnlocked) {
      letter.status = 'unlocked';
      await letter.save();
      letterJSON.status = 'unlocked';
    }

    res.json({
      success: true,
      data: { letter: letterJSON },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/letters/:id
 */
const updateLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      senderId: req.user._id,
      status: 'draft',
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or cannot be edited.',
      });
    }

    const { title, content, unlockDate } = req.body;
    if (title) letter.title = title;
    if (content !== undefined) letter.content = content;
    if (unlockDate) {
      if (new Date(unlockDate) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Unlock date must be in the future.',
        });
      }
      letter.unlockDate = unlockDate;
    }

    await letter.save();

    res.json({
      success: true,
      message: 'Draft updated!',
      data: { letter },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/letters/:id
 */
const deleteLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      senderId: req.user._id,
      status: 'draft',
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or cannot be deleted.',
      });
    }

    // Delete attachments from Cloudinary
    for (const att of letter.attachments) {
      if (att.publicId) {
        const resourceType = att.type === 'image' ? 'image' : 'video';
        await deleteFromCloudinary(att.publicId, resourceType);
      }
    }

    await Letter.findByIdAndDelete(letter._id);

    res.json({ success: true, message: 'Draft deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/letters/:id/seal
 */
const sealLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      senderId: req.user._id,
      status: 'draft',
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found.',
      });
    }

    if (!letter.title || !letter.unlockDate) {
      return res.status(400).json({
        success: false,
        message: 'Letter must have a title and unlock date to be sealed.',
      });
    }

    letter.status = 'sealed';
    await letter.save();

    res.json({
      success: true,
      message: 'Letter sealed! 💌 Your partner will receive it when the time comes.',
      data: { letter },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/letters/:id/react
 */
const reactToLetter = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const letter = await Letter.findOne({
      _id: req.params.id,
      coupleId: req.couple._id,
    });

    if (!letter) {
      return res.status(404).json({ success: false, message: 'Letter not found.' });
    }

    // Remove existing reaction from this user
    letter.reactions = letter.reactions.filter(
      (r) => r.userId.toString() !== req.user._id.toString()
    );

    // Add new reaction
    if (emoji) {
      letter.reactions.push({ userId: req.user._id, emoji });
    }

    await letter.save();

    res.json({
      success: true,
      data: { reactions: letter.reactions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/letters/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      receiverId: req.user._id,
    });

    if (!letter) {
      return res.status(404).json({ success: false, message: 'Letter not found.' });
    }

    if (!letter.isRead) {
      letter.isRead = true;
      letter.readAt = new Date();
      letter.status = 'read';
      await letter.save();
    }

    res.json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/letters/:id/archive
 */
const archiveLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findOneAndUpdate(
      { _id: req.params.id, coupleId: req.couple._id },
      { status: 'archived' },
      { new: true }
    );

    if (!letter) {
      return res.status(404).json({ success: false, message: 'Letter not found.' });
    }

    res.json({ success: true, message: 'Letter archived.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/letters/:id/attachments
 */
const addAttachment = async (req, res, next) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      senderId: req.user._id,
      status: 'draft',
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided.',
      });
    }

    const newAttachments = [];

    for (const file of req.files) {
      let type = 'image';
      let resourceType = 'image';

      if (file.mimetype.startsWith('audio/')) {
        type = 'audio';
        resourceType = 'video'; // Cloudinary treats audio as video
      } else if (file.mimetype.startsWith('video/')) {
        type = 'video';
        resourceType = 'video';
      }

      const result = await uploadToCloudinary(
        file.buffer,
        'letters',
        resourceType
      );

      newAttachments.push({
        type,
        url: result.url,
        publicId: result.publicId,
        metadata: {
          duration: result.duration,
          width: result.width,
          height: result.height,
        },
      });
    }

    letter.attachments.push(...newAttachments);
    await letter.save();

    res.json({
      success: true,
      message: `${newAttachments.length} file(s) uploaded!`,
      data: { attachments: letter.attachments },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLetter,
  getLetters,
  getLetter,
  updateLetter,
  deleteLetter,
  sealLetter,
  reactToLetter,
  markAsRead,
  archiveLetter,
  addAttachment,
};
