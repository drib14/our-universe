import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  History,
  MessageSquare,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Letters', path: '/capsule-mail', icon: Mail },
  { name: 'Story', path: '/our-story', icon: History },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-card border-t border-white/10 bg-rose-950/90 backdrop-blur-xl px-2 py-2">
      <div className="flex items-center justify-around w-full max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'text-rose-400 font-bold bg-rose-500/10'
                    : 'text-rose-200/60 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
