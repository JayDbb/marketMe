'use client';

import { useState } from 'react';
import { getMockWeekSchedule } from '@/lib/mock-data/calendar';
import { CalendarBoard } from '@/components/dashboard/calendar/calendar-board';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreatePostModal } from '@/components/dashboard/calendar/create-post-modal';
import { Post, DaySchedule } from '@/types/content';

export default function CalendarPage() {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(getMockWeekSchedule());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPost = (newPostData: Omit<Post, 'post_id' | 'status'>) => {
    const newPost: Post = {
      ...newPostData,
      post_id: Math.floor(Math.random() * 1000000), // Mock numerical ID
      status: 'draft',
    };

    // Add to the first day for mock purposes, or try to match the scheduled date
    const scheduledDate = new Date(newPost.scheduled_date);
    const dayIndex = scheduledDate.getDay(); // 0 is Sunday
    // For simplicity, just add it to the first column in the mock data, or try to match by date string.
    // Our mock data date strings are like "Monday, Jun 8". We will just prepend to the first day for now.
    setWeeklySchedule(prev => {
      const newSchedule = [...prev];
      if (newSchedule.length > 0) {
        newSchedule[0] = {
          ...newSchedule[0],
          posts: [newPost, ...newSchedule[0].posts],
        };
      }
      return newSchedule;
    });
  };

  return (
    <div className="flex flex-col h-full relative min-h-screen">
      {/* Header — sits flush on the dark page, no border box */}
      <div className="flex-none px-8 pt-8 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tighter text-white mb-1.5">
            Content Calendar
          </h1>
          <p className="text-white/40 text-sm font-light">
            Overview of scheduled campaigns and posts for the current week.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-zinc-950 hover:bg-white/90 gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </Button>
      </div>

      {/* Kanban Board */}
      <CalendarBoard schedule={weeklySchedule} setSchedule={setWeeklySchedule} />

      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPost}
      />
    </div>
  );
}
