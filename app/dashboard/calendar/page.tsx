import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { DaySchedule, Post, Platform, PostStatus } from '@/types/content'
import { CalendarClientWrapper } from '@/components/dashboard/calendar/calendar-client-wrapper'


function getWeekDays() {
  const days = []
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // adjust when day is sunday
  const monday = new Date(today.setDate(diff))
  
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(monday)
    nextDate.setDate(monday.getDate() + i)
    days.push(nextDate)
  }
  return days
}

async function CalendarData() {
  const { user } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  const supabase = supabaseAdmin
  const { data: dbPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true })

  const mappedPosts: Post[] = (dbPosts || []).map(p => ({
    post_id: p.id,
    business_id: 0,
    account_id: 0,
    caption: p.content || '',
    media_url: p.image_url,
    scheduled_date: p.scheduled_at || p.created_at,
    status: p.status as PostStatus,
    social_account: { platform: (p.platform as Platform) || 'twitter' }
  }))

  const weekDates = getWeekDays()
  
  const schedule: DaySchedule[] = weekDates.map(date => {
    const dateStr = date.toISOString().split('T')[0]
    const dayPosts = mappedPosts.filter(p => p.scheduled_date && p.scheduled_date.startsWith(dateStr))
    
    return {
      date: new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(date),
      posts: dayPosts
    }
  })

  return <CalendarClientWrapper initialSchedule={schedule} />
}

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full relative min-h-screen">
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-white/40">Loading calendar...</div>}>
        <CalendarData />
      </Suspense>
    </div>
  )
}
