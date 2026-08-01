import React from 'react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Sleek Abstract Infinity Heart Vector Logo */}
      <div
        className={`${sizes[size]} rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/40 relative overflow-hidden group hover:scale-105 transition-transform duration-300`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-white stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round drop-shadow-md"
        >
          {/* Twin Intertwined Infinity Heart Loops */}
          <path d="M 50 72 C 30 55, 10 38, 28 20 C 40 8, 50 30, 50 30 C 50 30, 60 8, 72 20 C 90 38, 70 55, 50 72 Z" />
          <circle cx="50" cy="40" r="4" fill="white" className="animate-ping" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-purple-300 font-sans`}
          >
            Pairly
          </span>
          <span className="text-[9px] uppercase tracking-widest text-rose-300/60 font-semibold -mt-1">
            Our Universe
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
