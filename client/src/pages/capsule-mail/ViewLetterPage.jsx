import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Heart, Sparkles, Clock, Calendar, Smile, Flame, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const reactionButtons = [
  { id: 'heart', label: 'Heart', icon: Heart, color: 'text-rose-400 fill-rose-400' },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles, color: 'text-amber-300 fill-amber-300' },
  { id: 'smile', label: 'Smile', icon: Smile, color: 'text-green-400' },
  { id: 'flame', label: 'Flame', icon: Flame, color: 'text-orange-400 fill-orange-400' },
  { id: 'thumbsUp', label: 'Like', icon: ThumbsUp, color: 'text-blue-400' },
];

const ViewLetterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnsealing, setIsUnsealing] = useState(false);
  const [isUnsealed, setIsUnsealed] = useState(false);

  useEffect(() => {
    fetchLetter();
  }, [id]);

  const fetchLetter = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/letters/${id}`);
      if (res.success && res.data) {
        const l = res.data.letter || res.data;
        setLetter(l);
        const unlocked = new Date(l.unlockDate) <= new Date() || l.status === 'unlocked';
        setIsUnsealed(unlocked);
      }
    } catch (err) {
      toast.error('Could not fetch letter.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnseal = () => {
    setIsUnsealing(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setIsUnsealing(false);
      setIsUnsealed(true);
    }, 1500);
  };

  const handleReact = async (reactionId) => {
    try {
      const res = await api.post(`/letters/${id}/react`, { emoji: reactionId });
      if (res.success) {
        toast.success(`Reaction added!`);
        fetchLetter();
      }
    } catch (err) {
      toast.error('Could not react to letter.');
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-rose-200/50">Opening letter envelope...</div>;
  }

  if (!letter) {
    return <div className="py-16 text-center text-white">Letter not found.</div>;
  }

  const isLockedDate = new Date(letter.unlockDate) > new Date() && !isUnsealed;

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl mx-auto">
      <SEO
        title={`${letter.title} — Pairly Capsule Letter`}
        description="Time-capsule letter unsealing."
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/capsule-mail')}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-rose-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-extrabold text-white">Capsule Letter</h2>
      </div>

      {isLockedDate ? (
        <Card className="p-12 text-center flex flex-col items-center gap-6 border-amber-500/30 bg-gradient-to-b from-amber-950/40 to-rose-950/60">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xl animate-pulse">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{letter.title}</h3>
            <p className="text-sm text-amber-200/70">
              This letter is sealed until{' '}
              <strong className="text-amber-300">
                {new Date(letter.unlockDate).toLocaleDateString()}
              </strong>
            </p>
          </div>
          <div className="px-6 py-3 rounded-full bg-black/40 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" /> Locked Capsule — Patience is Love
          </div>
        </Card>
      ) : !isUnsealed ? (
        <Card className="p-12 text-center flex flex-col items-center gap-6 border-rose-500/40 bg-gradient-to-b from-rose-950/60 to-purple-950/60">
          <motion.div
            animate={{ scale: isUnsealing ? [1, 1.2, 0.9, 1.3, 0] : 1 }}
            transition={{ duration: 1.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 border-4 border-amber-400 text-white flex flex-col items-center justify-center shadow-2xl shadow-rose-500/50 cursor-pointer"
            onClick={handleUnseal}
          >
            <Lock className="w-8 h-8" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase mt-1">SEALED</span>
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{letter.title}</h3>
            <p className="text-xs text-rose-200/60">Click the seal to open your letter</p>
          </div>
          <Button onClick={handleUnseal} isLoading={isUnsealing} size="lg" className="font-bold">
            Break Seal & Read Letter
          </Button>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-gradient-to-b from-rose-950/80 via-purple-950/80 to-slate-950/80 border-rose-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-extrabold text-white">{letter.title}</h3>
                <span className="text-xs text-rose-300/60 flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5" /> Unlocked on {new Date(letter.unlockDate).toLocaleDateString()}
                </span>
              </div>
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>

            <div className="text-lg text-white font-medium leading-relaxed whitespace-pre-wrap py-4">
              {letter.content}
            </div>

            {/* Reaction Bar with Lucide Icons */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300/60">Reaction:</span>
              <div className="flex gap-2">
                {reactionButtons.map((rb) => {
                  const Icon = rb.icon;
                  return (
                    <button
                      key={rb.id}
                      onClick={() => handleReact(rb.id)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-transform active:scale-125 cursor-pointer"
                      title={rb.label}
                    >
                      <Icon className={`w-5 h-5 ${rb.color}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ViewLetterPage;
