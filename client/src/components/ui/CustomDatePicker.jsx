import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => CURRENT_YEAR - 70 + i);

const CustomDatePicker = ({ label, value, onChange, placeholder = 'Select Date', required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Initial view year and month based on value or today
  const initialDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    // Format to YYYY-MM-DD
    const m = currentMonth + 1;
    const formattedMonth = m < 10 ? `0${m}` : `${m}`;
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    onChange(dateStr);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  const formattedDisplayValue = value
    ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${isOpen ? 'z-[9999]' : 'z-30'}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-rose-200/80 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Input Field Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-input w-full rounded-xl p-3 text-sm text-white flex items-center justify-between transition-all cursor-pointer hover:border-rose-500/50 ${
          isOpen ? 'border-rose-500 shadow-lg shadow-rose-500/20' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-rose-400 shrink-0" />
          <span className={formattedDisplayValue ? 'font-medium' : 'text-white/40'}>
            {formattedDisplayValue || placeholder}
          </span>
        </div>
      </button>

      {/* Custom Glassmorphic Calendar Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 w-72 glass-card bg-slate-950 border border-rose-500/40 rounded-2xl p-4 shadow-2xl z-[9999] backdrop-blur-2xl select-none"
          >
            {/* Header: Month & Year Navigator */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {/* Direct Month Select */}
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="bg-slate-900/90 text-rose-100 text-xs font-bold px-2 py-1 rounded-lg border border-white/20 focus:border-rose-400 focus:outline-none cursor-pointer"
                >
                  {MONTH_NAMES.map((monthName, idx) => (
                    <option key={monthName} value={idx} className="bg-slate-950 text-white">
                      {monthName}
                    </option>
                  ))}
                </select>

                {/* Direct Year Select */}
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="bg-slate-900/90 text-rose-100 text-xs font-bold px-2 py-1 rounded-lg border border-white/20 focus:border-rose-400 focus:outline-none cursor-pointer"
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-950 text-white">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_OF_WEEK.map((d) => (
                <span key={d} className="text-[10px] font-bold text-rose-400 uppercase">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Blank leading days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="h-8" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const m = currentMonth + 1;
                const formattedMonth = m < 10 ? `0${m}` : `${m}`;
                const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                const dayStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
                const isSelected = value && value.substring(0, 10) === dayStr;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-semibold flex items-center justify-center mx-auto transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/50 scale-105'
                        : 'text-rose-100 hover:bg-rose-500/20 hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Today Quick Selection Action */}
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const m = today.getMonth() + 1;
                  const formattedMonth = m < 10 ? `0${m}` : `${m}`;
                  const dayNum = today.getDate();
                  const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  onChange(`${today.getFullYear()}-${formattedMonth}-${formattedDay}`);
                  setIsOpen(false);
                }}
                className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[11px] font-semibold text-rose-200/50 hover:text-rose-200 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
