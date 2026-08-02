import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Heart,
  Image as ImageIcon,
  Smile,
  X,
  Check,
  CheckCheck,
  CornerDownRight,
  Sparkles,
  Paperclip,
  Flame,
  ThumbsUp,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import { getSocket, connectSocket } from '../../lib/socket';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';
import toast from 'react-hot-toast';

const quickStickers = [
  'I love you 💕',
  'Thinking of you ✨',
  'Miss you 😘',
  'Hug me 🤗',
  'Date night soon? 🥂',
];

const reactionOptions = [
  { emoji: '❤️', label: 'Heart' },
  { emoji: '😍', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '✨', label: 'Sparkles' },
  { emoji: '👍', label: 'Like' },
];

const ChatPage = () => {
  const { user } = useAuthStore();
  const { partner } = useCoupleStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Typing & Online Status
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Attachment & Media Preview State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  // Reply-To State
  const [replyingTo, setReplyingTo] = useState(null);

  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const socket = connectSocket();

    if (socket) {
      // Mark messages as read when opening chat
      socket.emit('read_messages');

      // Socket Listeners
      const handleNewMessage = (newMsg) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();

        // Mark as read if from partner
        const senderId = typeof newMsg.senderId === 'object' ? newMsg.senderId._id : newMsg.senderId;
        if (senderId !== user?._id) {
          socket.emit('read_messages');
        }
      };

      const handlePartnerTyping = (data) => {
        if (data.userId !== user?._id) {
          setIsPartnerTyping(true);
        }
      };

      const handlePartnerStopTyping = () => {
        setIsPartnerTyping(false);
      };

      const handlePartnerOnline = () => {
        setIsPartnerOnline(true);
      };

      const handlePartnerOffline = () => {
        setIsPartnerOnline(false);
      };

      const handleMessagesRead = () => {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true, readAt: new Date() }))
        );
      };

      const handleMessageReaction = ({ messageId, reactions }) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
        );
      };

      socket.on('new_message', handleNewMessage);
      socket.on('partner_typing', handlePartnerTyping);
      socket.on('partner_stop_typing', handlePartnerStopTyping);
      socket.on('partner_online', handlePartnerOnline);
      socket.on('partner_offline', handlePartnerOffline);
      socket.on('messages_read', handleMessagesRead);
      socket.on('message_reaction', handleMessageReaction);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('partner_typing', handlePartnerTyping);
        socket.off('partner_stop_typing', handlePartnerStopTyping);
        socket.off('partner_online', handlePartnerOnline);
        socket.off('partner_offline', handlePartnerOffline);
        socket.off('messages_read', handleMessagesRead);
        socket.off('message_reaction', handleMessageReaction);
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/chat');
      if (res.success && res.data) {
        setMessages(res.data.messages || res.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Fetch messages err:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    const socket = getSocket();

    if (socket && socket.connected) {
      socket.emit('typing');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing');
      }, 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    const text = inputMessage.trim();
    setIsSending(true);

    try {
      const socket = getSocket();

      // If file selected, send via multipart FormData endpoint
      if (selectedFile) {
        const formData = new FormData();
        formData.append('media', selectedFile);
        formData.append('content', text || 'Sent a photo');
        if (replyingTo) formData.append('replyTo', replyingTo._id);

        const res = await api.post('/chat', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.success && res.data?.message) {
          if (socket && socket.connected) {
            socket.emit('send_message', res.data.message);
          } else {
            setMessages((prev) => [...prev, res.data.message]);
          }
        }
      } else {
        // Text message via socket or API fallback
        if (socket && socket.connected) {
          socket.emit('send_message', {
            content: text,
            type: 'text',
            replyTo: replyingTo ? replyingTo._id : null,
          });
        } else {
          const res = await api.post('/chat', {
            content: text,
            type: 'text',
            replyTo: replyingTo ? replyingTo._id : null,
          });
          if (res.success && res.data?.message) {
            setMessages((prev) => [...prev, res.data.message]);
          }
        }
      }

      // Reset Form State
      setInputMessage('');
      setSelectedFile(null);
      setPreviewUrl('');
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (socket && socket.connected) socket.emit('stop_typing');
      scrollToBottom();
    } catch (err) {
      toast.error('Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSticker = (stickerText) => {
    setInputMessage(stickerText);
    setTimeout(() => {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('send_message', { content: stickerText, type: 'text' });
        setInputMessage('');
        scrollToBottom();
      }
    }, 50);
  };

  const handleReactToMessage = async (messageId, emoji) => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('react_to_message', { messageId, emoji });
      } else {
        await api.post(`/chat/${messageId}/react`, { emoji });
        fetchMessages();
      }
    } catch (err) {
      toast.error('Reaction failed.');
    }
  };

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-120px)] max-h-[800px] w-full">
      <SEO
        title="Private Chat — Pairly Sanctuary"
        description="Real-time messaging with media sharing, typing status, and read receipts."
      />

      {/* Header */}
      <Card className="p-4 flex items-center justify-between border-rose-500/30 bg-rose-950/70 backdrop-blur-xl shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar src={partner?.avatar} name={partner?.name || 'Partner'} size="md" className="border-purple-500" />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-rose-950 ${
                isPartnerOnline ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              {partner?.name || 'Partner'}{' '}
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400 inline" />
            </h3>
            <span className="text-[11px] font-semibold text-rose-200/70">
              {isPartnerOnline ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Online Now
                </span>
              ) : (
                'Private Sanctuary Room'
              )}
            </span>
          </div>
        </div>
      </Card>

      {/* Messages Scroll Area */}
      <Card className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-rose-950/40 border-white/10 relative">
        {isLoading ? (
          <div className="py-12 text-center text-rose-200/50 text-xs font-medium">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="my-auto text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Start your private conversation</h4>
            <p className="text-xs text-rose-200/60 max-w-xs">
              Send a love note, photo, or quick sticker to your partner!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
            const isMe = senderId === user?._id;

            return (
              <div
                key={msg._id || idx}
                className={`flex flex-col max-w-[80%] sm:max-w-[70%] group ${
                  isMe ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                {/* Quoted Reply Preview */}
                {msg.replyTo && (
                  <div className="text-[11px] px-3 py-1.5 rounded-xl bg-white/10 text-rose-200/80 mb-1 border-l-2 border-rose-400 max-w-full truncate flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">
                      {typeof msg.replyTo === 'object' ? msg.replyTo.content : 'Quoted Message'}
                    </span>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className="relative flex items-center gap-2">
                  {/* Quick Action Overlay (Reply & Reactions) */}
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 border border-white/10 rounded-full px-2 py-1 shadow-lg ${
                      isMe ? 'order-first' : 'order-last'
                    }`}
                  >
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="text-[10px] text-rose-300 hover:text-white font-bold px-1"
                      title="Reply"
                    >
                      Reply
                    </button>
                    <div className="h-3 w-px bg-white/20" />
                    {reactionOptions.map((ro) => (
                      <button
                        key={ro.emoji}
                        onClick={() => handleReactToMessage(msg._id, ro.emoji)}
                        className="text-xs hover:scale-125 transition-transform"
                      >
                        {ro.emoji}
                      </button>
                    ))}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`p-3.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white shadow-lg shadow-rose-500/20 rounded-br-none'
                        : 'glass-card text-rose-100 border-white/10 rounded-bl-none'
                    }`}
                  >
                    {/* Media Photo */}
                    {msg.mediaUrl && (
                      <img
                        src={msg.mediaUrl}
                        alt="Chat Attachment"
                        onClick={() => setLightboxImage(msg.mediaUrl)}
                        className="w-full max-h-60 rounded-xl object-cover mb-2 cursor-pointer border border-white/10 hover:opacity-90 transition-opacity"
                      />
                    )}

                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                    {/* Reactions Display Badge */}
                    {msg.reactions?.length > 0 && (
                      <div className="flex gap-1 mt-1.5 pt-1 border-t border-white/10">
                        {msg.reactions.map((r, i) => (
                          <span key={i} className="text-xs bg-black/30 px-1.5 py-0.5 rounded-full">
                            {r.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp & Read Receipt */}
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-rose-300/40">
                  <span>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {isMe && (
                    <span title={msg.isRead ? 'Read by partner' : 'Sent'}>
                      {msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-rose-300 font-bold" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-rose-300/50" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Real-time Typing Indicator */}
        {isPartnerTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start text-xs font-bold text-rose-300 flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{partner?.name || 'Partner'} is typing message...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* Quick Stickers Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {quickStickers.map((stk) => (
          <button
            key={stk}
            type="button"
            onClick={() => handleSendSticker(stk)}
            className="px-3 py-1 rounded-full text-xs font-semibold glass-card text-rose-200 hover:text-white hover:bg-rose-500/20 border border-white/10 transition-all shrink-0 cursor-pointer"
          >
            {stk}
          </button>
        ))}
      </div>

      {/* Quoted Message Preview Banner */}
      {replyingTo && (
        <div className="p-2.5 rounded-xl glass-card border border-rose-500/40 bg-rose-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs truncate">
            <CornerDownRight className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-rose-200/60 font-semibold">Replying to:</span>
            <span className="text-white font-medium truncate">{replyingTo.content}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-rose-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Photo Preview Thumbnail */}
      {previewUrl && (
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-rose-500 glass-card shrink-0">
          <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute top-1 right-1 p-1 bg-slate-950/80 text-rose-300 hover:text-white rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <form onSubmit={handleSendMessage} className="flex gap-2 items-center shrink-0">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-xl glass-card border border-white/15 text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all cursor-pointer shrink-0"
          title="Attach Photo"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <Input
          placeholder="Write a love note or message..."
          value={inputMessage}
          onChange={handleInputChange}
          containerClassName="flex-1"
        />

        <Button type="submit" isLoading={isSending} size="md" className="shrink-0 font-bold px-5">
          <Send className="w-4 h-4" /> Send
        </Button>
      </form>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <Modal isOpen={!!lightboxImage} onClose={() => setLightboxImage(null)} title="Photo View">
          <img src={lightboxImage} alt="Attachment" className="w-full rounded-2xl max-h-[75vh] object-contain" />
        </Modal>
      )}
    </div>
  );
};

export default ChatPage;
