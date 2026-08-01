import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Plus, Lock, Unlock, Clock, Send, Heart, Archive } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import SEO from '../../components/ui/SEO';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const LettersPage = () => {
  const [letters, setLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // received | sent | drafts
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/letters');
      if (res.success && res.data) {
        setLetters(res.data.letters || res.data);
      }
    } catch (err) {
      toast.error('Could not load capsule letters.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLetters = letters.filter((letter) => {
    if (activeTab === 'received') return letter.status !== 'draft' && letter.receiverId;
    if (activeTab === 'sent') return letter.status !== 'draft' && letter.senderId;
    if (activeTab === 'drafts') return letter.status === 'draft';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SEO
        title="Capsule Mail — Pairly Time Letters"
        description="Write and seal digital time-capsule letters for your partner to unlock on future anniversaries and special dates."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-rose-400" /> Capsule Mail
          </h2>
          <p className="text-xs text-rose-200/60 mt-1">
            Write time-capsule letters locked until future anniversaries or dates.
          </p>
        </div>
        <Link to="/capsule-mail/compose">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" /> Write New Letter
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl glass-card border border-white/10 w-fit">
        {[
          { id: 'received', label: 'Received' },
          { id: 'sent', label: 'Sent' },
          { id: 'drafts', label: 'Drafts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-rose-200/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Letters List Grid */}
      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : filteredLetters.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-300 flex items-center justify-center">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No letters found</h3>
          <p className="text-xs text-rose-200/60 max-w-sm">
            {activeTab === 'received'
              ? 'No letters received yet. Ask your partner to write one!'
              : 'Write your first time capsule letter to unlock in the future.'}
          </p>
          <Link to="/capsule-mail/compose">
            <Button size="sm" className="mt-2">
              Compose Letter Now
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLetters.map((letter) => {
            const isUnlocked = new Date(letter.unlockDate) <= new Date() || letter.status === 'unlocked';
            return (
              <Link key={letter._id} to={`/capsule-mail/${letter._id}`}>
                <Card className="h-full group hover:border-rose-500/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Sealed
                          </span>
                        )}
                        <span className="text-[11px] text-rose-200/40">
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {letter.reactions?.length > 0 && (
                        <span className="text-xs">
                          {letter.reactions[0].emoji}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                      {letter.title || 'Untitled Time Letter'}
                    </h3>
                    <p className="text-xs text-rose-200/60 line-clamp-2 mt-1">
                      {letter.content?.replace(/<[^>]*>?/gm, '') || 'Sealed time capsule content...'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-rose-300/70 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Unlock: {new Date(letter.unlockDate).toLocaleDateString()}
                    </span>
                    <span className="text-rose-400 font-bold group-hover:underline">
                      Read Capsule →
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LettersPage;
