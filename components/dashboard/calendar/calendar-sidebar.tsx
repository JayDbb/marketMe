'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, User, Check } from 'lucide-react'

interface CalendarSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function CalendarSidebar({ currentDate, onDateChange }: CalendarSidebarProps) {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // JavaScript getDay(): Sun=0, Mon=1...Sat=6
  // Our grid: Mo=0, Tu=1...Su=6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday

  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevMonthDates = Array.from({ length: startingDayOfWeek }, (_, i) => prevMonthDays - startingDayOfWeek + i + 1);
  const currentMonthDates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    onDateChange(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    onDateChange(d);
  };

  const handleDateClick = (d: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(d);
    onDateChange(newDate);
  };
  
  return (
    <div className="w-[320px] shrink-0 bg-zinc-50/90 dark:bg-[#0c0c18]/90 backdrop-blur-3xl border border-zinc-200 dark:border-white/10 rounded-[2rem] flex flex-col p-6 overflow-y-auto overflow-x-hidden custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10">
      

      {/* Mini Calendar Picker */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="w-7 h-7 rounded-lg bg-white dark:hover:bg-white/5 border-zinc-200 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-white dark:hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNextMonth} className="w-7 h-7 rounded-lg bg-white dark:hover:bg-white/5 border-zinc-200 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-white dark:hover:bg-white/10 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-3 mb-2">
          {days.map(d => (
            <div key={d} className="text-[10px] font-bold text-zinc-500 dark:text-white/30 text-center uppercase tracking-wider">{d}</div>
          ))}
          
          {prevMonthDates.map(d => (
            <div key={`prev-${d}`} className="text-xs text-zinc-500 dark:text-white/10 text-center font-medium py-1">{d}</div>
          ))}
          
          {currentMonthDates.map(d => {
            const isSelected = d === currentDate.getDate();
            return (
              <div key={d} className="flex justify-center">
                <button 
                  onClick={() => handleDateClick(d)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isSelected 
                      ? 'bg-purple-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                      : 'text-zinc-500 dark:text-white/70 hover:bg-white dark:bg-white/10 border-zinc-200'
                  }`}
                >
                  {d}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Event Card (Floating Glassmorphism) */}
      <div className="relative rounded-2xl bg-linear-to-br from-[#1a1a2e] to-[#0c0c18] border border-zinc-200 dark:border-white/10 p-5 mb-8 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-[11px] font-mono text-zinc-500 dark:text-white/50">12:00 - 13:30</span>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-white/5 rounded-full text-[10px] font-bold text-purple-400 border border-purple-500/20">
            <Clock className="w-3 h-3" /> 14 min
          </div>
        </div>
        
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 pr-8 leading-snug relative z-10">
          Meet Gabriel at the International Library
        </h4>
        
        <div className="flex gap-2 relative z-10">
          <button className="flex-1 py-2 rounded-xl bg-transparent border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-500 dark:text-white/70 hover:bg-white dark:hover:bg-white/5 transition-colors">
            Later
          </button>
          <button className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-colors">
            Details
          </button>
        </div>
      </div>



    </div>
  )
}
