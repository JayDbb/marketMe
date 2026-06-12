export type PostStatus = 'draft' | 'pending_approval' | 'approved' | 'published';
export type Platform = 'twitter' | 'linkedin' | 'instagram';

export interface Post {
  post_id: number;
  business_id: number;
  account_id: number;
  idea_id?: number | null;
  schedule_id?: number | null;
  caption: string;
  media_url?: string | null;
  scheduled_date: string; // ISO string
  status: PostStatus;
  // Joined relation for UI convenience
  social_account?: {
    platform: Platform;
  };
  // Local only UI property for file uploads
  file?: File | null;
}

export interface DaySchedule {
  date: string;
  posts: Post[];
}
