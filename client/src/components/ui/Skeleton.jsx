import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular', // rectangular | circular | text
  width,
  height,
  ...props
}) => {
  const baseClasses =
    'relative overflow-hidden bg-rose-950/50 border border-white/5 animate-pulse rounded-xl';

  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-full my-1',
  };

  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
};

export const SkeletonCard = ({ rows = 3 }) => {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 border border-white/10">
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" width={44} height={44} />
        <Skeleton width={80} height={20} className="rounded-full" />
      </div>
      <Skeleton width="70%" height={24} />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width={`${90 - i * 15}%`} height={16} />
        ))}
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
