import React from 'react';

/**
 * Get 1-2 letter initials from full name
 * e.g. "Jhon Doe" -> "JD", "Alex" -> "AL"
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const cleanName = name.trim();
  if (!cleanName) return '?';
  const parts = cleanName.split(/\s+/);
  if (parts.length === 1) {
    return cleanName.length >= 2
      ? cleanName.substring(0, 2).toUpperCase()
      : cleanName.toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-extrabold',
  xl: 'w-20 h-20 text-2xl font-extrabold',
};

const Avatar = ({ src, name = '', size = 'md', className = '', alt = '' }) => {
  const imageUrl = typeof src === 'object' ? src?.url : src;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt || name || 'Avatar'}
        className={`${sizeClass} rounded-full object-cover border-2 border-rose-500/40 shadow-md ${className}`}
        onError={(e) => {
          // If image fails to load, hide image element to let fallback initials show
          e.currentTarget.style.display = 'none';
          if (e.currentTarget.nextSibling) {
            e.currentTarget.nextSibling.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-tr from-rose-600 to-purple-600 text-white flex items-center justify-center font-bold border-2 border-rose-400/40 shadow-md tracking-wider shrink-0 ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
