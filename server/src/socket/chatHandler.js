const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');
const Message = require('../models/Message');
const Couple = require('../models/Couple');

// Track online users: userId -> socketId
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🟢 ${socket.user.name} connected (${socket.id})`);

    // Track online status
    onlineUsers.set(userId, socket.id);

    // Join couple room
    if (socket.user.coupleId) {
      const coupleRoom = `couple:${socket.user.coupleId}`;
      socket.join(coupleRoom);

      // Notify room partner that user is online
      socket.to(coupleRoom).emit('partner_online', {
        userId,
        name: socket.user.name,
      });

      // Check if partner is already online and notify connecting user
      if (socket.user.partnerId) {
        const partnerIdStr = socket.user.partnerId._id
          ? socket.user.partnerId._id.toString()
          : socket.user.partnerId.toString();
        if (onlineUsers.has(partnerIdStr)) {
          socket.emit('partner_online', { userId: partnerIdStr });
        }
      }
    }

    // ── CHAT EVENTS ──

    socket.on('send_message', async (data) => {
      try {
        if (!socket.user.coupleId) return;

        // If data is already a populated message object from API upload
        if (data._id && data.content) {
          const coupleRoom = `couple:${socket.user.coupleId}`;
          socket.to(coupleRoom).emit('new_message', data);
          return;
        }

        const message = await Message.create({
          coupleId: socket.user.coupleId,
          senderId: socket.user._id,
          content: data.content,
          type: data.type || 'text',
          mediaUrl: data.mediaUrl || '',
          replyTo: data.replyTo || null,
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'name avatar')
          .populate('replyTo');

        const coupleRoom = `couple:${socket.user.coupleId}`;
        io.to(coupleRoom).emit('new_message', populated);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', () => {
      if (!socket.user.coupleId) return;
      const coupleRoom = `couple:${socket.user.coupleId}`;
      socket.to(coupleRoom).emit('partner_typing', {
        userId,
        name: socket.user.name,
      });
    });

    socket.on('stop_typing', () => {
      if (!socket.user.coupleId) return;
      const coupleRoom = `couple:${socket.user.coupleId}`;
      socket.to(coupleRoom).emit('partner_stop_typing', { userId });
    });

    socket.on('read_messages', async () => {
      try {
        if (!socket.user.coupleId) return;
        await Message.updateMany(
          {
            coupleId: socket.user.coupleId,
            senderId: { $ne: socket.user._id },
            isRead: false,
          },
          { isRead: true, readAt: new Date() }
        );

        const coupleRoom = `couple:${socket.user.coupleId}`;
        socket.to(coupleRoom).emit('messages_read', { readBy: userId });
      } catch (error) {
        console.error('Read messages error:', error);
      }
    });

    socket.on('react_to_message', async (data) => {
      try {
        const message = await Message.findById(data.messageId);
        if (!message) return;

        message.reactions = message.reactions.filter(
          (r) => r.userId.toString() !== userId
        );
        if (data.emoji) {
          message.reactions.push({ userId: socket.user._id, emoji: data.emoji });
        }
        await message.save();

        const coupleRoom = `couple:${socket.user.coupleId}`;
        io.to(coupleRoom).emit('message_reaction', {
          messageId: data.messageId,
          reactions: message.reactions,
        });
      } catch (error) {
        console.error('React error:', error);
      }
    });

    // ── DISCONNECT ──

    socket.on('disconnect', () => {
      console.log(`🔴 ${socket.user.name} disconnected`);
      onlineUsers.delete(userId);

      if (socket.user.coupleId) {
        const coupleRoom = `couple:${socket.user.coupleId}`;
        socket.to(coupleRoom).emit('partner_offline', { userId });
      }
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
