import { Post, DaySchedule } from '@/types/content';

// Helper to generate ISO strings for specific days of a mock week (e.g. current week)
const getMockDate = (dayOffset: number, hour: number, minute: number = 0) => {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - baseDate.getDay() + 1 + dayOffset); // Start from this week's Monday
  baseDate.setHours(hour, minute, 0, 0);
  return baseDate.toISOString();
};

export const MOCK_POSTS: Post[] = [
  // MONDAY
  {
    id: 'post-1',
    content: 'Excited to announce our new deep-learning pipeline for lead scoring. Thread below on how we achieved 94% accuracy with minimal training data. 🧵👇',
    status: 'posted',
    platform: 'twitter',
    scheduledFor: getMockDate(0, 9, 0),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    authorId: 'user-1',
  },
  {
    id: 'post-2',
    content: 'We are hiring! Looking for Senior Design Engineers who understand that aesthetics and performance are the same thing. DM me or apply via link in bio.',
    status: 'posted',
    platform: 'linkedin',
    scheduledFor: getMockDate(0, 11, 30),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    authorId: 'user-1',
  },
  
  // TUESDAY
  {
    id: 'post-3',
    content: 'Behind the scenes: how our engineering team structures massive monolithic repos without losing velocity. 🏗️',
    status: 'posted',
    platform: 'twitter',
    scheduledFor: getMockDate(1, 10, 0),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    authorId: 'user-2',
  },
  {
    id: 'post-4',
    content: 'Stop prioritizing generic metrics. If your dashboard doesn’t tell you EXACTLY what to do next, you’ve built a vanity mirror, not a cockpit.',
    status: 'posted',
    platform: 'linkedin',
    scheduledFor: getMockDate(1, 14, 15),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    authorId: 'user-1',
  },

  // WEDNESDAY
  {
    id: 'post-5',
    content: 'The "Editorial Brutalism" aesthetic is polarizing, but it converts. Why stark contrast outperforms friendly SaaS interfaces in B2B.',
    status: 'scheduled',
    platform: 'linkedin',
    scheduledFor: getMockDate(2, 9, 45),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    authorId: 'user-1',
  },
  
  // THURSDAY
  {
    id: 'post-6',
    content: 'Just deployed our new global noise texture. A 1kb SVG that completely changes the psychological feel of the application. Details inside.',
    status: 'approved',
    platform: 'twitter',
    scheduledFor: getMockDate(3, 11, 0),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    authorId: 'user-2',
  },
  {
    id: 'post-7',
    content: 'Weekly product teardown: Why most B2B onboarding flows are actively hurting your retention. And how to fix it in 3 steps.',
    status: 'approved',
    platform: 'linkedin',
    scheduledFor: getMockDate(3, 15, 30),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    authorId: 'user-1',
  },

  // FRIDAY
  {
    id: 'post-8',
    content: 'Are you using Framer Motion for structural layout shifts or just vanity fades? The difference is perceived performance vs actual bloat.',
    status: 'draft',
    platform: 'twitter',
    scheduledFor: getMockDate(4, 10, 0),
    createdAt: new Date().toISOString(),
    authorId: 'user-1',
  },
  {
    id: 'post-9',
    content: 'Our CEO will be speaking at the SaaS Design Summit this weekend. Drop by our booth to see Marketme 3.0 in action.',
    status: 'draft',
    platform: 'linkedin',
    scheduledFor: getMockDate(4, 13, 0),
    createdAt: new Date().toISOString(),
    authorId: 'user-1',
  },
];

export const getMockWeekSchedule = (): DaySchedule[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return days.map((dayName, index) => {
    // Filter posts for this specific day offset
    const dayPosts = MOCK_POSTS.filter(post => {
      const postDate = new Date(post.scheduledFor);
      // Ensure we match the day of the week (Monday = 1, Sunday = 0)
      const dayOfWeek = postDate.getDay();
      const expectedDay = index === 6 ? 0 : index + 1; // Convert index to JS Date.getDay() format
      return dayOfWeek === expectedDay;
    });

    // Sort posts chronologically
    dayPosts.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

    // Generate a pretty date string for the header
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() - mockDate.getDay() + 1 + index);

    return {
      date: `${dayName}, ${mockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      posts: dayPosts
    };
  });
};
