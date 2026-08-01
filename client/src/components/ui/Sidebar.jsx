import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  History,
  Smile,
  Gift,
  Image,
  MapPin,
  Trophy,
  Music,
  Calendar,
  MessageSquare,
  Settings,
} from 'lucide-react';

const navItems = [
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

const Sidebar = () => {
  return (
    <aside className="w-64 shrink-0 hidden lg:block glass-card border-r border-white/10 p-4 min-h-[calc(100vh-65px)] bg-rose-950/40">
      <div className="flex flex-col gap-1 sticky top-20">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-rose-300/50">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 text-rose-200 border border-rose-500/30 shadow-md shadow-rose-950/50'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-rose-400" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
