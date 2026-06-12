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
    post_id: 1,
    business_id: 1,
    account_id: 101,
    caption: 'Excited to announce our new deep-learning pipeline for lead scoring. Thread below on how we achieved 94% accuracy with minimal training data. 🧵👇',
    status: 'published',
    scheduled_date: getMockDate(0, 9, 0),
    social_account: { platform: 'twitter' }
  },
  {
    post_id: 2,
    business_id: 1,
    account_id: 102,
    caption: 'We are hiring! Looking for Senior Design Engineers who understand that aesthetics and performance are the same thing. DM me or apply via link in bio.',
    status: 'published',
    scheduled_date: getMockDate(0, 11, 30),
    social_account: { platform: 'linkedin' }
  },
  
  // TUESDAY
  {
    post_id: 3,
    business_id: 1,
    account_id: 101,
    caption: 'Behind the scenes: how our engineering team structures massive monolithic repos without losing velocity. 🏗️',
    status: 'published',
    scheduled_date: getMockDate(1, 10, 0),
    social_account: { platform: 'twitter' }
  },
  {
    post_id: 4,
    business_id: 1,
    account_id: 102,
    caption: 'Stop prioritizing generic metrics. If your dashboard doesn’t tell you EXACTLY what to do next, you’ve built a vanity mirror, not a cockpit.',
    status: 'published',
    scheduled_date: getMockDate(1, 14, 15),
    social_account: { platform: 'linkedin' }
  },

  // WEDNESDAY
  {
    post_id: 5,
    business_id: 1,
    account_id: 102,
    caption: 'The "Editorial Brutalism" aesthetic is polarizing, but it converts. Why stark contrast outperforms friendly SaaS interfaces in B2B.',
    status: 'pending_approval',
    scheduled_date: getMockDate(2, 9, 45),
    social_account: { platform: 'linkedin' }
  },
  
  // THURSDAY
  {
    post_id: 6,
    business_id: 1,
    account_id: 101,
    caption: 'Just deployed our new global noise texture. A 1kb SVG that completely changes the psychological feel of the application. Details inside.',
    status: 'approved',
    scheduled_date: getMockDate(3, 11, 0),
    social_account: { platform: 'twitter' }
  },
  {
    post_id: 7,
    business_id: 1,
    account_id: 102,
    caption: 'Weekly product teardown: Why most B2B onboarding flows are actively hurting your retention. And how to fix it in 3 steps.',
    status: 'approved',
    scheduled_date: getMockDate(3, 15, 30),
    social_account: { platform: 'linkedin' }
  },

  // FRIDAY
  {
    post_id: 8,
    business_id: 1,
    account_id: 101,
    caption: 'Are you using Framer Motion for structural layout shifts or just vanity fades? The difference is perceived performance vs actual bloat.',
    status: 'draft',
    scheduled_date: getMockDate(4, 10, 0),
    social_account: { platform: 'twitter' }
  },
  {
    post_id: 9,
    business_id: 1,
    account_id: 102,
    caption: 'Our CEO will be speaking at the SaaS Design Summit this weekend. Drop by our booth to see Marketme 3.0 in action.',
    status: 'draft',
    scheduled_date: getMockDate(4, 13, 0),
    social_account: { platform: 'linkedin' }
  },
];

export const getMockWeekSchedule = (): DaySchedule[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return days.map((dayName, index) => {
    // Filter posts for this specific day offset
    const dayPosts = MOCK_POSTS.filter(post => {
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
};
