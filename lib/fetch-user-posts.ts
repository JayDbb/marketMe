import type { Post } from '@/types/content'
import { supabaseAdmin } from '@/lib/supabase/admin'
<<<<<<< HEAD
=======
import { mapDbRowToPost, POST_INBOX_TAB_STATUSES } from '@/lib/post-utils'
import {
  collectTemplateIds,
  fetchTemplatePreviewsById,
} from '@/lib/fetch-template-previews'
>>>>>>> origin/development

export type FetchUserPostsOptions = {
  scheduledOnly?: boolean
  requireScheduled?: boolean
}

export type FetchUserPostsResult = {
  posts: Post[]
  error: string | null
}

<<<<<<< HEAD
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
=======
export type FetchPlannerPostsResult = {
  posts: Post[]
  undatedDrafts: Post[]
  error: string | null
}

async function mapRows(
  rows: Record<string, unknown>[] | null,
  requireScheduled = false
): Promise<Post[]> {
  const list = rows ?? []
  const templates = await fetchTemplatePreviewsById(collectTemplateIds(list))
  return list
    .map((row) => {
      const templateId = row.template_id as string | null | undefined
      return mapDbRowToPost(row, {
        requireScheduled,
        template: templateId ? templates.get(templateId) ?? null : null,
      })
    })
    .filter((post): post is Post => post != null)
>>>>>>> origin/development
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

<<<<<<< HEAD
  return { posts: (data ?? []).map(mapRowToPost), error: null }
=======
  return {
    posts: await mapRows(data as Record<string, unknown>[] | null, options.requireScheduled),
    error: null,
  }
}

export async function fetchPlannerPostsResult(
  userId: string
): Promise<FetchPlannerPostsResult> {
  const datedQuery = supabaseAdmin
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .not('scheduled_at', 'is', null)
    .order('scheduled_at', { ascending: true })

  const undatedQuery = supabaseAdmin
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .is('scheduled_at', null)
    .in('status', POST_INBOX_TAB_STATUSES.drafts)
    .order('created_at', { ascending: false })
    .limit(40)

  const [dated, undated] = await Promise.all([datedQuery, undatedQuery])

  if (dated.error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[fetchPlannerPosts]', dated.error.message)
    }
    return {
      posts: [],
      undatedDrafts: [],
      error: 'Could not load posts. Please refresh the page.',
    }
  }

  if (undated.error && process.env.NODE_ENV === 'development') {
    console.error('[fetchPlannerPosts.undated]', undated.error.message)
  }

  return {
    posts: await mapRows(dated.data as Record<string, unknown>[] | null, true),
    undatedDrafts: undated.error
      ? []
      : await mapRows(undated.data as Record<string, unknown>[] | null),
    error: null,
  }
>>>>>>> origin/development
}

export async function fetchUserPosts(
  userId: string,
  options: FetchUserPostsOptions = {}
): Promise<Post[]> {
  const { posts } = await fetchUserPostsResult(userId, options)
  return posts
}
