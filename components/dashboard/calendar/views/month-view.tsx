'use client'

import { Post } from '@/types/content'
import { motion } from 'framer-motion'

export function MonthView({ posts, currentDate }: { posts: Post[], currentDate: Date }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalSlots = startingDayOfWeek + daysInMonth;
  const totalGridCells = Math.ceil(totalSlots / 7) * 7;
  
  const calendarCells = Array.from({ length: totalGridCells }).map((_, idx) => {
    if (idx < startingDayOfWeek) {
      return { day: prevMonthDays - startingDayOfWeek + idx + 1, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - startingDayOfWeek + idx + 1) };
    } else if (idx >= startingDayOfWeek + daysInMonth) {
      return { day: idx - (startingDayOfWeek + daysInMonth) + 1, isCurrentMonth: false, date: new Date(year, month + 1, idx - (startingDayOfWeek + daysInMonth) + 1) };
    } else {
      const currentDay = idx - startingDayOfWeek + 1;
      return { day: currentDay, isCurrentMonth: true, date: new Date(year, month, currentDay) };
    }
  });

  return (
    <div className="flex-1 w-full grid grid-cols-7 gap-px bg-white dark:bg-white/5 border-zinc-200 border dark:border-white/5 rounded-2xl overflow-hidden auto-rows-fr">
      {calendarCells.map((cell, idx) => {
        // Find posts for this exact date
        const dayPosts = posts.filter(p => {
          const pd = new Date(p.scheduled_date);
          return pd.getFullYear() === cell.date.getFullYear() && 
                 pd.getMonth() === cell.date.getMonth() && 
                 pd.getDate() === cell.date.getDate();
        });
        
        return (
          <div key={idx} className={`bg-zinc-50/90 dark:bg-[#0c0c18]/90 min-h-[120px] p-3 flex flex-col transition-colors cursor-pointer group ${cell.isCurrentMonth ? 'hover:bg-white dark:bg-white/5 border-zinc-200' : 'opacity-40'}`}>
            <span className={`text-sm font-bold transition-colors ${
              cell.date.toDateString() === new Date().toDateString() 
                ? 'text-purple-400' 
                : cell.isCurrentMonth ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-white/20'
            }`}>
              {cell.day}
            </span>
            <div className="mt-auto space-y-1">
              {dayPosts.slice(0, 3).map((p, i) => (
                <div key={i} className="text-[10px] truncate px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-medium border border-purple-500/20 capitalize">
                  {p.social_account?.platform || 'Social'}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
