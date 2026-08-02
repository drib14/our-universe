import React from 'react';
import { LogOut, Heart } from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import useAuthStore from '../../stores/useAuthStore';
import useCoupleStore from '../../stores/useCoupleStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { couple, partner: storePartner } = useCoupleStore();

  const partner = storePartner || (typeof user?.partnerId === 'object' ? user?.partnerId : null);

  const calculateDays = () => {
    const startDate = couple?.anniversaryDate || user?.relationshipStartDate;
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysTogether = calculateDays();

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-white/10 bg-rose-950/80 backdrop-blur-xl px-4 sm:px-8 py-3">
      <div className="flex items-center justify-between w-full">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Center: Days Together Counter */}
        {daysTogether > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs font-medium">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-bounce" />
            <span className="hidden sm:inline">
              <strong className="text-white text-sm font-bold">{daysTogether}</strong> Days Together
            </span>
            <span className="sm:hidden font-bold text-white text-xs">
              {daysTogether}d
            </span>
          </div>
        )}

        {/* Right: Avatars + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            <Avatar src={user?.avatar} name={user?.name} size="sm" className="border-rose-500" />
            {partner && (
              <Avatar src={partner?.avatar} name={partner?.name} size="sm" className="border-purple-500" />
            )}
          </div>

          <span className="hidden sm:inline text-xs font-medium text-rose-200/90">
            {user?.name} {partner ? `& ${partner.name}` : ''}
          </span>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-rose-200/60 hover:text-rose-300 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
