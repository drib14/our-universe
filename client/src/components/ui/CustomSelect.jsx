import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ label, options = [], value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${isOpen ? 'z-[9999]' : 'z-30'}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-rose-200/80 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-input w-full rounded-xl p-3 text-sm text-white flex items-center justify-between transition-all cursor-pointer hover:border-rose-500/50 ${
          isOpen ? 'border-rose-500 shadow-lg shadow-rose-500/20' : ''
        } ${className}`}
      >
        <span className="font-medium truncate">{selectedOption?.label || value}</span>
        <ChevronDown
          className={`w-4 h-4 text-rose-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 glass-card bg-slate-950 border border-rose-500/40 rounded-xl p-1.5 shadow-2xl z-[9999] max-h-56 overflow-y-auto backdrop-blur-xl"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-rose-100/80 hover:bg-rose-500/10 hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
