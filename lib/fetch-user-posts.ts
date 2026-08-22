import type { Post } from '@/types/content'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type FetchUserPostsOptions = {
  scheduledOnly?: boolean
  requireScheduled?: boolean
}

export type FetchUserPostsResult = {
  posts: Post[]
  error: string | null
}

function mapRowToPost(row: Record<string, unknown>): Post {
  return {
    post_id: row.id as string,
    caption: (row.content as string) || '',
    media_url: (row.image_url as string) ?? null,
    scheduled_date: (row.scheduled_at as string) || new Date().toISOString(),
    status: row.status as Post['status'],
    social_account: {
      platform: ((row.platform as string) || 'social').toLowerCase(),
    },
  }
}

/** Fetch posts for a user via service role (Better Auth has no Supabase JWT). */
export async function fetchUserPostsResult(
  userId: string,
  options: FetchUserPostsOptions = {}
): Promise<FetchUserPostsResult> {
  let query = supabaseAdmin
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (options.scheduledOnly || options.requireScheduled) {
    query = query.not('scheduled_at', 'is', null)
  }

  const { data, error } = await query

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[fetchUserPosts]', error.message)
    }
    return { posts: [], error: 'Could not load posts. Please refresh the page.' }
  }

  return { posts: (data ?? []).map(mapRowToPost), error: null }
}

export async function fetchUserPosts(
  userId: string,
  options: FetchUserPostsOptions = {}
): Promise<Post[]> {
  const { posts } = await fetchUserPostsResult(userId, options)
  return posts
}
