'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Post } from '@/types/content';
import { getWeekScheduleAction } from '@/app/dashboard/calendar/actions';

// Components
import { CalendarSidebar } from '@/components/dashboard/calendar/calendar-sidebar';
import { WeekView } from '@/components/dashboard/calendar/views/week-view';
import { MonthView } from '@/components/dashboard/calendar/views/month-view';
import { DayView } from '@/components/dashboard/calendar/views/day-view';
import { CreatePostModal } from '@/components/dashboard/calendar/create-post-modal';

type ViewMode = 'Month' | 'Week' | 'Day';

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // For MVP, we fetch the schedule which brings in DB posts
    getWeekScheduleAction().then((schedule) => {
      // Flatten the days into a single array of posts
      const allPosts = schedule.flatMap(day => day.posts);
      setPosts(allPosts);
      setIsLoading(false);
    });
  }, []);

  const handlePrev = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'Month') d.setMonth(d.getMonth() - 1);
      if (viewMode === 'Week') d.setDate(d.getDate() - 7);
      if (viewMode === 'Day') d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'Month') d.setMonth(d.getMonth() + 1);
      if (viewMode === 'Week') d.setDate(d.getDate() + 7);
      if (viewMode === 'Day') d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="w-full h-[calc(100vh-2rem)] flex gap-6 p-6 overflow-hidden">
      {/* Dark Sidebar Component */}
      <CalendarSidebar currentDate={currentDate} onDateChange={setCurrentDate} />

      {/* Main Calendar Area - Adapted to Dark Theme */}
      <div className="flex-1 flex flex-col bg-zinc-50/80 dark:bg-[#0c0c18]/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="px-8 py-6 flex flex-col xl:flex-row xl:items-center justify-between border-b border-zinc-200 dark:border-white/5 gap-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>

          <div className="flex items-center gap-4 lg:gap-6 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
            {/* View Toggles */}
            <div className="flex bg-white dark:bg-white/5 border-zinc-200 p-1 rounded-xl border dark:border-white/10 shrink-0">
              {(['Month', 'Week', 'Day'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    viewMode === mode 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-zinc-500 dark:hover:text-white/50 hover:text- dark:hover:text-$3$3 hover:bg-white dark:bg-white/5 border-zinc-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handlePrev} className="w-9 h-9 rounded-xl bg-white dark:hover:bg-white/5 border-zinc-200 flex items-center justify-center text-zinc-500 dark:hover:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-colors border dark:border-white/5">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleToday} className="px-4 py-1.5 rounded-xl bg-white dark:hover:bg-white/5 border-zinc-200 text-sm font-bold text-zinc-500 dark:text-white/90 hover:bg-white dark:hover:bg-white/10 transition-colors border dark:border-white/5">
                Today
              </button>
              <button onClick={handleNext} className="w-9 h-9 rounded-xl bg-white dark:hover:bg-white/5 border-zinc-200 flex items-center justify-center text-zinc-500 dark:hover:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-colors border dark:border-white/5">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-px h-8 bg-white dark:bg-white/10 border-zinc-200 shrink-0 hidden md:block" />

            {/* Add Event Action */}
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 flex items-center shadow-[0_0_20px_rgba(168,85,247,0.4)] text-zinc-900 dark:text-white font-bold gap-2 shrink-0 border-0"
            >
               <Plus className="w-4 h-4" /> Create Post
            </Button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 overflow-hidden p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col"
            >
              {viewMode === 'Week' && <WeekView posts={posts} currentDate={currentDate} />}
              {viewMode === 'Month' && <MonthView posts={posts} currentDate={currentDate} />}
              {viewMode === 'Day' && <DayView posts={posts} currentDate={currentDate} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={() => setIsModalOpen(false)} />
    </div>
  )
}
