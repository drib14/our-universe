import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Smile, Paperclip, Heart } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuthStore();
  const { partner } = useCoupleStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const socket = getSocket();

    if (socket) {
      socket.on('receive_message', (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      });

      socket.on('typing_status', (data) => {
        if (data.userId !== user?._id) {
          setIsTyping(data.isTyping);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('typing_status');
      }
    };
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/chat/messages');
      if (res.success && res.data) {
        setMessages(res.data.messages || res.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Fetch messages err:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');

    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('send_message', { content: text, type: 'text' });
      } else {
        const res = await api.post('/chat/messages', { content: text, type: 'text' });
        if (res.success && res.data) {
          setMessages((prev) => [...prev, res.data.message || res.data]);
        }
      }
      scrollToBottom();
    } catch (err) {
      toast.error('Could not send message.');
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] max-h-[750px]">
      {/* Header */}
      <Card className="p-4 flex items-center justify-between border-rose-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {partner?.name?.[0] || 'P'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {partner?.name || 'Partner'} 💕
            </h3>
            <span className="text-[11px] text-green-400 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> Live Connected
            </span>
          </div>
        </div>
      </Card>

      {/* Messages Scroll Area */}
      <Card className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-rose-950/40 border-white/10">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user?._id || msg.sender === user?._id;
          return (
            <div
              key={msg._id || idx}
              className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/20 rounded-br-none'
                    : 'glass-card text-rose-100 border-white/10 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-rose-300/40 mt-1 px-1">
                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="self-start text-xs text-rose-300/60 font-semibold animate-pulse">
            {partner?.name || 'Partner'} is typing love note...
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          placeholder="Write a message to your love..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          containerClassName="flex-1"
        />
        <Button type="submit" size="md" className="shrink-0 font-bold px-5">
          <Send className="w-4 h-4" /> Send
        </Button>
      </form>
    </div>
  );
};

export default ChatPage;
