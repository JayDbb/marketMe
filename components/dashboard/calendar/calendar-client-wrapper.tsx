'use client'

import { useState } from 'react'
import { CalendarBoard } from '@/components/dashboard/calendar/calendar-board'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreatePostModal } from '@/components/dashboard/calendar/create-post-modal'
import { Post, DaySchedule } from '@/types/content'

export function CalendarClientWrapper({ initialSchedule }: { initialSchedule: DaySchedule[] }) {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(initialSchedule)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddPost = (newPostData: Omit<Post, 'post_id' | 'status'>) => {
    const newPost: Post = {
      ...newPostData,
      post_id: Math.floor(Math.random() * 1000000), // Local ID until synced
      status: 'draft',
    }

    setWeeklySchedule(prev => {
      const newSchedule = [...prev]
      if (newSchedule.length > 0) {
        newSchedule[0] = {
          ...newSchedule[0],
          posts: [newPost, ...newSchedule[0].posts],
        }
      }
      return newSchedule
    })
  }

  return (
    <>
      <div className="flex-none px-8 pt-8 pb-6 flex items-start justify-between relative z-10">
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

      <CalendarBoard schedule={weeklySchedule} setSchedule={setWeeklySchedule} />

      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPost}
      />
    </>
  )
}
