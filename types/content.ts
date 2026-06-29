export type PostStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'scheduled' | 'failed';
export type Platform = 'twitter' | 'linkedin' | 'instagram' | string;

export interface Post {
  post_id: string | number;
  business_id?: number | string;
  account_id?: number | string;
  idea_id?: number | string | null;
  schedule_id?: number | string | null;
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
