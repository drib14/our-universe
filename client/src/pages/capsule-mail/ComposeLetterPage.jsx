import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Calendar, Lock, Image as ImageIcon, Send, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const ComposeLetterPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !unlockDate) {
      toast.error('Please complete title, content, and unlock date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/letters', {
        title,
        content,
        unlockDate,
        status: 'sealed',
      });

      if (res.success) {
        toast.success('Time capsule sealed and sent!');
        navigate('/capsule-mail');
      } else {
        toast.error(res.message || 'Failed to seal letter.');
      }
    } catch (err) {
      toast.error(err.message || 'Could not send letter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl mx-auto">
      <SEO
        title="Compose Capsule Letter — Pairly"
        description="Write a future love letter sealed in a time capsule for your partner."
      />
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-rose-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-rose-400" /> Write Future Letter
        </h2>
      </div>

      <Card className="p-6 sm:p-8 bg-rose-950/60 border-rose-500/30">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Letter Title"
            placeholder="e.g. Open on Our Next Anniversary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <CustomDatePicker
            label="Future Unlock Date"
            value={unlockDate}
            onChange={(dateVal) => setUnlockDate(dateVal)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-200/80 tracking-wide uppercase">
              Letter Content
            </label>
            <textarea
              rows={8}
              placeholder="Write your heartfelt letter here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="glass-input w-full rounded-2xl p-4 text-base text-white placeholder-white/30 focus:border-rose-400 focus:outline-none resize-none font-sans"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-rose-300/60 flex items-center gap-1">
              <Lock className="w-4 h-4 text-amber-400" /> Letter remains encrypted until unlock date
            </span>
            <Button type="submit" isLoading={isSubmitting} size="lg" className="font-bold">
              Seal & Send Letter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ComposeLetterPage;
