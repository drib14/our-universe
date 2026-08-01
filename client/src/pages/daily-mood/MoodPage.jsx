import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smile, Heart, TrendingUp, Laugh, Meh, Frown, Annoyed } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import useCoupleStore from '../../stores/useCoupleStore';
import toast from 'react-hot-toast';

const moodOptions = [
  { value: 5, icon: Laugh, label: 'Overjoyed', color: 'text-amber-300' },
  { value: 4, icon: Smile, label: 'Happy', color: 'text-green-300' },
  { value: 3, icon: Meh, label: 'Neutral', color: 'text-blue-300' },
  { value: 2, icon: Frown, label: 'Sad', color: 'text-purple-300' },
  { value: 1, icon: Annoyed, label: 'Stressed', color: 'text-rose-400' },
];

const MoodPage = () => {
  const { partner } = useCoupleStore();
  const [selectedMood, setSelectedMood] = useState(4);
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const res = await api.get('/moods');
      if (res.success && res.data) {
        setMoodHistory(res.data.moods || res.data);
      }
    } catch (err) {
      toast.error('Could not fetch mood history.');
    }
  };

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/moods', {
        mood: selectedMood,
        note,
      });

      if (res.success) {
        toast.success('Mood checked in for today!');
        setNote('');
        fetchMoods();
      }
    } catch (err) {
      toast.error(err.message || 'Error checking in mood.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = moodHistory.slice(-7).map((m) => ({
    date: new Date(m.createdAt || m.date).toLocaleDateString(undefined, { weekday: 'short' }),
    mood: m.mood,
  }));

  const SelectedIcon = moodOptions.find((m) => m.value === selectedMood)?.icon || Smile;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Daily Mood Check-in — Pairly"
        description="Share daily emotions and stay connected with your partner."
      />

      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Smile className="w-8 h-8 text-rose-400" /> Daily Mood Check-in
        </h2>
        <p className="text-xs text-rose-200/60 mt-1">
          Share your daily emotions and keep track of your emotional connection.
        </p>
      </div>

      {/* Mood Selector Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-b from-rose-950/60 to-purple-950/60 border-rose-500/30">
        <h3 className="text-xl font-bold text-white text-center mb-6">How are you feeling today?</h3>

        <div className="flex justify-center items-center gap-3 sm:gap-6 mb-6">
          {moodOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMood(opt.value)}
                className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all cursor-pointer ${
                  selectedMood === opt.value
                    ? 'bg-rose-500/30 border-2 border-rose-400 shadow-xl shadow-rose-500/20'
                    : 'glass-card border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${opt.color}`} />
                <span className="text-[11px] font-bold text-rose-200">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="max-w-md mx-auto flex flex-col gap-3">
          <textarea
            rows={2}
            placeholder="Add an optional note (e.g. Busy day at work, missing you...)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="glass-input w-full rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none"
          />
          <Button onClick={handleCheckIn} isLoading={isSubmitting} className="w-full font-bold py-3">
            <Heart className="w-4 h-4 fill-white" /> Submit Daily Check-in
          </Button>
        </div>
      </Card>

      {/* Analytics & History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-400" /> Weekly Mood Trend
          </h3>
          {chartData.length > 0 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="#f43f5e" fontSize={12} />
                  <YAxis domain={[1, 5]} hide />
                  <Tooltip
                    contentStyle={{ background: '#1c051d', borderColor: '#f43f5e', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#f43f5e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-rose-200/50 py-8 text-center">No trend data yet. Check in today!</p>
          )}
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> Partner's Status
            </h3>
            <p className="text-xs text-rose-200/60 mb-4">
              {partner ? `Connected with ${partner.name}` : 'Waiting for partner check-in...'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center flex flex-col items-center">
            <SelectedIcon className="w-10 h-10 text-rose-300 mb-2" />
            <span className="text-xs text-rose-200 font-semibold">Partner checked in today</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MoodPage;
