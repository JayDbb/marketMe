export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'posted';
export type Platform = 'twitter' | 'linkedin' | 'instagram';

export interface Post {
  id: string;
  content: string;
  status: PostStatus;
  platform: Platform;
  scheduledFor: string; // ISO string representation of the date and time
  createdAt: string;
  authorId: string;
  assetUrl?: string; // Optional image/video associated with the post
}

export interface DaySchedule {
  date: string;
  posts: Post[];
}
