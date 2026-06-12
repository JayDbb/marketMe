'use client'

import { useState } from 'react';
import { DaySchedule } from '@/types/content';
import { PostCard } from './post-card';

interface CalendarBoardProps {
  schedule: DaySchedule[];
  setSchedule: React.Dispatch<React.SetStateAction<DaySchedule[]>>;
}

export function CalendarBoard({ schedule, setSchedule }: CalendarBoardProps) {

  const handleApprove = (postId: number) => {
    setSchedule(prev =>
      prev.map(day => ({
        ...day,
        posts: day.posts.map(post =>
          post.post_id === postId ? { ...post, status: 'pending_approval' as const } : post
        ),
      }))
    );
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-max px-6 pb-6 gap-4">
        {schedule.map((day, index) => {
          // Parse the date string: "Monday, Jun 8" → day name + date badge
          const parts = day.date.split(', ');
          const dayName = parts[0];                              // "Monday"
          const datePart = parts[1]?.toUpperCase() ?? '';       // "JUN 8"

          return (
            <div
              key={index}
              className="w-[260px] shrink-0 flex flex-col rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="font-medium text-[15px] text-white tracking-tight">
                  {dayName}
                </h3>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.12em]">
                  {datePart}
                </span>
              </div>

              {/* Posts (scrollable) */}
              <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
                {day.posts.length > 0 ? (
                  day.posts.map(post => (
                    <PostCard
                      key={post.post_id}
                      post={post}
                      onApprove={
                        post.status === 'draft'
                          ? () => handleApprove(post.post_id)
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center border border-dashed border-white/8 rounded-xl min-h-[100px] mx-1">
                    <p className="text-[11px] text-white/20 tracking-wide">No posts</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
