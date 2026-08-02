import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Mail,
  History,
  Smile,
  Gift,
  Image,
  MapPin,
  Music,
  Calendar,
  MessageSquare,
  Settings,
  Grid,
  X,
  Heart,
} from 'lucide-react';

const allNavItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Capsule Mail', path: '/capsule-mail', icon: Mail, badge: 'Future' },
  { name: 'Our Story', path: '/our-story', icon: History },
  { name: 'Daily Mood', path: '/daily-mood', icon: Smile },
  { name: 'Surprise Box', path: '/surprises', icon: Gift },
  { name: 'Memories', path: '/memories', icon: Image },
  { name: 'Places Map', path: '/places', icon: MapPin },
  { name: 'Shared Songs', path: '/songs', icon: Music },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Private Chat', path: '/chat', icon: MessageSquare },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const primaryMobileItems = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
  { name: 'Letters', path: '/capsule-mail', icon: Mail },
  { name: 'Story', path: '/our-story', icon: History },
];

const MobileNav = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Glassmorphic Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-card border-t border-white/15 bg-slate-950/95 backdrop-blur-2xl px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around w-full max-w-md mx-auto">
          {primaryMobileItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    isActive
                      ? 'text-rose-400 font-extrabold bg-rose-500/15 border border-rose-500/20'
                      : 'text-rose-200/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* "More Features" Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              isDrawerOpen
                ? 'text-purple-300 bg-purple-500/20 border border-purple-500/30'
                : 'text-rose-200/60 hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Full Mobile Navigation Overlay Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Slide-Up Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-h-[85vh] glass-card bg-slate-950 border-t-2 border-rose-500/40 rounded-t-3xl p-5 overflow-y-auto shadow-2xl flex flex-col gap-4 select-none z-10"
            >
              {/* Drawer Handle & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">All Features</h3>
                    <p className="text-[10px] text-rose-200/60 font-semibold">Your Private Relationship Universe</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-rose-300 hover:text-white rounded-xl bg-white/5 border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2-Column Responsive Grid of All Navigation Items */}
              <div className="grid grid-cols-2 gap-2 py-2">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 text-rose-200 border-rose-500/40 shadow-lg shadow-rose-950/60'
                            : 'glass-card text-rose-100/80 border-white/10 hover:bg-rose-500/10 hover:text-white'
                        }`
                      }
                    >
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex flex-col truncate">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] text-rose-300 font-extrabold uppercase">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
