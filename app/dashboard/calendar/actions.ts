'use server'

import { createClient } from '@/lib/supabase/server'
import { DaySchedule, Post } from '@/types/content'

function getEmptySchedule(): DaySchedule[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days.map((dayName, index) => {
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() - mockDate.getDay() + 1 + index);
    return {
      date: `${dayName}, ${mockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      posts: []
    };
  });
}

export async function getWeekScheduleAction(): Promise<DaySchedule[]> {
  const emptySchedule = getEmptySchedule();
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return emptySchedule;

  const { data: postsData, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)

  if (error || !postsData) {
    console.error('Error fetching posts:', error)
    return emptySchedule;
  }

  // Convert DB posts to UI Posts
  const uiPosts: Post[] = postsData.map(dbPost => ({
    post_id: dbPost.id,
    caption: dbPost.content || '',
    media_url: dbPost.image_url,
    scheduled_date: dbPost.scheduled_at || new Date().toISOString(), // Fallback if null
    status: dbPost.status,
    social_account: { platform: dbPost.platform?.toLowerCase() || 'twitter' }
  }))

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const schedule = days.map((dayName, index) => {
    // Filter posts for this specific day offset
    const dayPosts = uiPosts.filter(post => {
      const postDate = new Date(post.scheduled_date);
      // Ensure we match the day of the week (Monday = 1, Sunday = 0)
      const dayOfWeek = postDate.getDay();
      const expectedDay = index === 6 ? 0 : index + 1; // Convert index to JS Date.getDay() format
      return dayOfWeek === expectedDay;
    });

    // Sort posts chronologically
    dayPosts.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

    // Generate a pretty date string for the header
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() - mockDate.getDay() + 1 + index);

    return {
      date: `${dayName}, ${mockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      posts: dayPosts
    };
  });

  return schedule;
}
