import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      type = 'text',
      className = '',
      containerClassName = '',
      placeholder = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-xs font-medium text-rose-200/80 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 text-rose-300/60 pointer-events-none">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`glass-input w-full rounded-xl py-2.5 text-sm text-white placeholder-white/30 transition-all duration-200 ${
              Icon ? 'pl-11 pr-4' : 'px-4'
            } ${error ? 'border-red-500/60 focus:border-red-400' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-400 font-medium mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
