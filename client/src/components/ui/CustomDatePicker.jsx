import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CustomDatePicker = ({ label, value, onChange, placeholder = 'Select Date', required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'

  // Initial view year and month based on value or today
  const initialDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  // For years view pagination (12 years per page)
  const [yearPageStart, setYearPageStart] = useState(Math.floor(initialDate.getFullYear() / 12) * 12);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
        setYearPageStart(Math.floor(d.getFullYear() / 12) * 12);
      }
    }
  }, [value]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year, month) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    if (viewMode === 'days') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === 'years') {
      setYearPageStart(yearPageStart - 12);
    }
  };

  const handleNext = () => {
    if (viewMode === 'days') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === 'years') {
      setYearPageStart(yearPageStart + 12);
    }
  };

  const handleSelectDay = (day) => {
    const m = currentMonth + 1;
    const formattedMonth = m < 10 ? `0${m}` : `${m}`;
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    onChange(dateStr);
    setIsOpen(false);
    setViewMode('days');
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  const formattedDisplayValue = value
    ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-rose-200/80 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Input Field Trigger */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setViewMode('days');
        }}
        className={`glass-input w-full rounded-xl p-3 text-sm text-white flex items-center justify-between transition-all cursor-pointer hover:border-rose-500/50 ${
          isOpen ? 'border-rose-500 shadow-lg shadow-rose-500/20' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-rose-400 shrink-0" />
          <span className={formattedDisplayValue ? 'font-medium text-white' : 'text-white/40'}>
            {formattedDisplayValue || placeholder}
          </span>
        </div>
      </button>

      {/* Modal Popup Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setViewMode('days');
              }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Popup Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-xs sm:max-w-sm glass-card bg-slate-950/95 border border-rose-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl select-none flex flex-col gap-3"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-rose-300">
                  <CalendarIcon className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
                    {label || 'Select Date'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setViewMode('days');
                  }}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Month & Year Controls Bar */}
              <div className="flex items-center justify-between gap-1 py-1">
                {viewMode !== 'months' ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Previous"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                ) : <div className="w-8" />}

                <div className="flex items-center gap-1.5">
                  {/* Month Button */}
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'months'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-white/5 hover:bg-white/10 text-rose-100 border border-white/10 hover:border-rose-400/50'
                    }`}
                  >
                    <span>{MONTH_NAMES[currentMonth]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${viewMode === 'months' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Year Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setYearPageStart(Math.floor(currentYear / 12) * 12);
                      setViewMode(viewMode === 'years' ? 'days' : 'years');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'years'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-white/5 hover:bg-white/10 text-rose-100 border border-white/10 hover:border-rose-400/50'
                    }`}
                  >
                    <span>
                      {viewMode === 'years' ? `${yearPageStart} - ${yearPageStart + 11}` : currentYear}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${viewMode === 'years' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {viewMode !== 'months' ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Next"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                ) : <div className="w-8" />}
              </div>

              {/* View Modes */}
              <AnimatePresence mode="wait">
                {viewMode === 'days' && (
                  <motion.div
                    key="days"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                  >
                    {/* Days of Week Row */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                      {DAYS_OF_WEEK.map((d) => (
                        <span key={d} className="text-[11px] font-bold text-rose-400 uppercase">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Blank leading days */}
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`blank-${i}`} className="h-9" />
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
                            className={`h-9 w-9 rounded-xl text-xs font-semibold flex items-center justify-center mx-auto transition-all cursor-pointer ${
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
                  </motion.div>
                )}

                {viewMode === 'months' && (
                  <motion.div
                    key="months"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="grid grid-cols-3 gap-2 py-1"
                  >
                    {MONTH_SHORT.map((mName, idx) => {
                      const isCurrentMonth = currentMonth === idx;
                      return (
                        <button
                          key={mName}
                          type="button"
                          onClick={() => {
                            setCurrentMonth(idx);
                            setViewMode('days');
                          }}
                          className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                            isCurrentMonth
                              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/40 scale-105'
                              : 'bg-white/5 border-white/10 text-rose-100/90 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-white'
                          }`}
                        >
                          {mName}
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {viewMode === 'years' && (
                  <motion.div
                    key="years"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="grid grid-cols-3 gap-2 py-1"
                  >
                    {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((yr) => {
                      const isSelectedYear = currentYear === yr;
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => {
                            setCurrentYear(yr);
                            setViewMode('days');
                          }}
                          className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                            isSelectedYear
                              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/40 scale-105'
                              : 'bg-white/5 border-white/10 text-rose-100/90 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-white'
                          }`}
                        >
                          {yr}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal Footer Actions */}
              <div className="mt-1 pt-3 border-t border-white/10 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const m = today.getMonth() + 1;
                    const formattedMonth = m < 10 ? `0${m}` : `${m}`;
                    const dayNum = today.getDate();
                    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                    setCurrentYear(today.getFullYear());
                    setCurrentMonth(today.getMonth());
                    onChange(`${today.getFullYear()}-${formattedMonth}-${formattedDay}`);
                    setIsOpen(false);
                    setViewMode('days');
                  }}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  Select Today
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                      setViewMode('days');
                    }}
                    className="text-xs font-semibold text-rose-200/50 hover:text-rose-200 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setViewMode('days');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDatePicker;
