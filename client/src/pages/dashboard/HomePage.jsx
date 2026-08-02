import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Mail,
  Smile,
  Gift,
  MapPin,
  Sparkles,
  Trophy,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import SEO from '../../components/ui/SEO';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';

const HomePage = () => {
  const { user } = useAuthStore();
  const { couple, partner } = useCoupleStore();

  const calculateDays = () => {
    const startDate = couple?.anniversaryDate || user?.relationshipStartDate;
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysTogether = calculateDays();

  const modules = [
    {
      title: 'Capsule Mail',
      desc: 'Letters locked until future dates',
      icon: Mail,
      link: '/capsule-mail',
      color: 'from-pink-500 to-rose-600',
    },
    {
      title: 'Daily Mood',
      desc: 'Share your feelings today',
      icon: Smile,
      link: '/daily-mood',
      color: 'from-amber-500 to-rose-500',
    },
    {
      title: 'Surprise Box',
      desc: 'Gift cards & open-when notes',
      icon: Gift,
      link: '/surprises',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Places Map',
      desc: 'Pin date spots & vacations',
      icon: MapPin,
      link: '/places',
      color: 'from-emerald-500 to-teal-600',
    },

    {
      title: 'Private Chat',
      desc: 'Real-time love notes & chat',
      icon: MessageSquare,
      link: '/chat',
      color: 'from-rose-500 to-purple-600',
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <SEO
        title={`Dashboard — ${user?.name || 'Couple'} & ${partner?.name || 'Partner'}'s Sanctuary | Pairly`}
        description="Overview of your private couples dashboard, days together counter, time-capsule letters, mood check-ins, and relationship memories."
      />
      {/* Hero Days Together Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 glass-card border border-rose-500/30 bg-gradient-to-r from-rose-900/60 via-purple-900/40 to-slate-900/60 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{user?.name} & {partner?.name || 'Partner'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {daysTogether > 0 ? (
                <>
                  Together for <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">{daysTogether} Days</span>
                </>
              ) : (
                'Welcome to Pairly'
              )}
            </h2>
            <p className="text-sm text-rose-200/70 mt-2 max-w-md">
              Your private sanctuary to preserve memories, exchange letters, check moods, and grow together.
            </p>
          </div>

          {/* Platform Logo Widget */}
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Logo size="xl" showText={false} />
          </div>
        </div>
      </motion.div>

      {/* Quick Access Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" /> Quick Access Modules
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.title} to={mod.link}>
                <Card className="h-full group hover:border-rose-500/50 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${mod.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-rose-300/40 group-hover:text-rose-300 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-lg font-bold text-white mt-4">{mod.title}</h4>
                  <p className="text-xs text-rose-200/60 mt-1">{mod.desc}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-rose-900/20 border-white/10">
        <h4 className="text-base font-bold text-white mb-3">Instant Actions for Two</h4>
        <div className="flex flex-wrap gap-3">
          <Link to="/capsule-mail?action=compose">
            <Button size="sm" variant="primary">
              <Mail className="w-4 h-4" /> Write Future Letter
            </Button>
          </Link>
          <Link to="/daily-mood">
            <Button size="sm" variant="secondary">
              <Smile className="w-4 h-4" /> Check-in Mood Today
            </Button>
          </Link>
          <Link to="/places">
            <Button size="sm" variant="outline">
              <MapPin className="w-4 h-4" /> Drop Date Pin
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
