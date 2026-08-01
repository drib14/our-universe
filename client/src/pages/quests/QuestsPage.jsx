import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, CheckCircle2, Circle, Sparkles, Award, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const defaultQuests = [
  {
    id: 'q1',
    title: 'Weekly Romance Challenge',
    rewardHearts: 50,
    tasks: [
      { id: 't1', text: 'Plan a surprise date night together', isCompleted: true },
      { id: 't2', text: 'Write a love letter in Capsule Mail', isCompleted: false },
      { id: 't3', text: 'Check-in daily mood 3 days in a row', isCompleted: false },
    ],
  },
  {
    id: 'q2',
    title: 'Memory Builder Goal',
    rewardHearts: 30,
    tasks: [
      { id: 't1', text: 'Upload 2 photos to Memory Book', isCompleted: false },
      { id: 't2', text: 'Pin a new date spot on Relationship Map', isCompleted: true },
    ],
  },
];

const QuestsPage = () => {
  const [quests, setQuests] = useState(defaultQuests);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(140);
  const maxXp = 200;

  const handleToggleTask = (questId, taskId) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          const updatedTasks = q.tasks.map((t) =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
          );
          return { ...q, tasks: updatedTasks };
        }
        return q;
      })
    );

    // Trigger celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    toast.success('Task completed! +15 XP ❤️');
    setXp((prev) => Math.min(maxXp, prev + 15));
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" /> Couple Quests & Levels
        </h2>
        <p className="text-xs text-rose-200/60 mt-1">
          Complete weekly relationship goals together to earn hearts and level up!
        </p>
      </div>

      {/* Level & XP Hero Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-purple-900/60 via-rose-900/60 to-slate-900/60 border-amber-500/40 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-xl shadow-amber-500/30">
              Lvl {level}
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Couple Rank: Soulmates
              </span>
              <h3 className="text-2xl font-extrabold text-white">Level {level} Relationship</h3>
              <p className="text-xs text-rose-200/70 mt-1">{xp} / {maxXp} XP to Level {level + 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
            <Heart className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>340 Hearts Earned</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden mt-6 border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(xp / maxXp) * 100}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 rounded-full"
          />
        </div>
      </Card>

      {/* Active Quests */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" /> Active Weekly Quests
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((quest) => (
            <Card key={quest.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">{quest.title}</h4>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    +{quest.rewardHearts} Hearts
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {quest.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(quest.id, task.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-rose-300/40 shrink-0" />
                      )}
                      <span className={`text-sm ${task.isCompleted ? 'line-through text-rose-200/40' : 'text-rose-100'}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestsPage;
