import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Mail, MapPin, Music, MessageSquare, ShieldCheck, Trophy } from 'lucide-react';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import SEO from '../../components/ui/SEO';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-purple-950 to-slate-950 text-white flex flex-col justify-between overflow-hidden relative">
      <SEO
        title="Pairly — #1 Private Couples App & Relationship Sanctuary"
        description="Write time-capsule letters, pin dates on your relationship map, check in daily moods, and level up with couple quests."
      />

      {/* Background Animated Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 text-center z-10 flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4 text-rose-400 animate-spin" />
          <span>The Private Space Built Expressly For Two</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-rose-300"
        >
          Keep Your Unique Love Story Beautifully Alive.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-rose-200/70 max-w-2xl font-light"
        >
          From scheduled time-capsule letters and real-time mood check-ins to shared playlists, gift boxes, and memory maps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <Link to="/register">
            <Button size="lg" className="px-8 text-lg font-bold">
              Start Our Journey Free
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="px-8 text-lg">
              Partner Login
            </Button>
          </Link>
        </motion.div>

        {/* Feature Grid Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-16 text-left">
          {[
            {
              icon: Mail,
              title: 'Capsule Mail',
              desc: 'Write letters to be unlocked on future anniversaries or dates.',
            },
            {
              icon: MapPin,
              title: 'Relationship Map',
              desc: 'Pin your first date, favorite dates, and unforgettable trips.',
            },
            {
              icon: Music,
              title: 'Shared Playlist',
              desc: 'Curate your joint soundtrack with track covers and audio previews.',
            },
            {
              icon: MessageSquare,
              title: 'Private Chat',
              desc: 'Real-time messaging with custom stickers, voice notes & read receipts.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all flex flex-col gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-1">{item.title}</h3>
                <p className="text-xs text-rose-200/60 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-white/10 text-xs text-rose-200/40">
        © 2026 Pairly — Our Universe. Crafted for couples everywhere.
      </footer>
    </div>
  );
};

export default LandingPage;
