import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  POSTS_PAGE_SIZE,
  POST_INBOX_TAB_STATUSES,
  mapDbRowToInboxPost,
  sanitizeSearchQuery,
  type InboxPost,
  type PostInboxTab,
} from '@/lib/post-utils'

export type PostsInboxCounts = Record<PostInboxTab, number>

export type PostsInboxResult = {
  posts: InboxPost[]
  total: number
  workspaceTotal: number
  counts: PostsInboxCounts
  page: number
  pageSize: number
  error: string | null
}

const EMPTY_COUNTS: PostsInboxCounts = {
  upcoming: 0,
  drafts: 0,
  published: 0,
  failed: 0,
}

export async function fetchPostsInbox(
  userId: string,
  options: {
    tab: PostInboxTab
    page: number
    query?: string
    platform?: string
  }
): Promise<PostsInboxResult> {
  const page = Math.max(1, options.page)
  const platform = options.platform ?? 'all'
  const search = sanitizeSearchQuery(options.query ?? '')
  const statuses = POST_INBOX_TAB_STATUSES[options.tab]
  const from = (page - 1) * POSTS_PAGE_SIZE
  const to = from + POSTS_PAGE_SIZE - 1

  const countTab = async (tab: PostInboxTab) => {
    let q = supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', POST_INBOX_TAB_STATUSES[tab])
    if (platform !== 'all') {
      q = q.ilike('platform', platform)
    }
    const { count, error } = await q
    return { tab, count: count ?? 0, error: error?.message ?? null }
  }

  let listQuery = supabaseAdmin
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .in('status', statuses)

  if (platform !== 'all') {
    listQuery = listQuery.ilike('platform', platform)
  }

  if (search) {
    listQuery = listQuery.or(
      `content.ilike.%${search}%,platform.ilike.%${search}%`
    )
  }

  if (options.tab === 'upcoming') {
    listQuery = listQuery.order('scheduled_at', {
      ascending: true,
      nullsFirst: false,
    })
  } else if (options.tab === 'drafts') {
    listQuery = listQuery.order('created_at', { ascending: false })
  } else if (options.tab === 'published') {
    listQuery = listQuery.order('scheduled_at', {
      ascending: false,
      nullsFirst: false,
    })
  } else {
    listQuery = listQuery.order('updated_at', { ascending: false })
  }

  const workspaceCountQuery = supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const [listResult, workspaceCount, ...tabCounts] = await Promise.all([
    listQuery.range(from, to),
    workspaceCountQuery,
    countTab('upcoming'),
    countTab('drafts'),
    countTab('published'),
    countTab('failed'),
  ])

  const counts = { ...EMPTY_COUNTS }
  let countError: string | null = null
  for (const row of tabCounts) {
    counts[row.tab] = row.count
    if (row.error) countError = row.error
  }

  if (listResult.error) {
    return {
      posts: [],
      total: 0,
      workspaceTotal: workspaceCount.count ?? 0,
      counts,
      page,
      pageSize: POSTS_PAGE_SIZE,
      error: 'Could not load posts. Please refresh the page.',
    }
  }

  const posts = (listResult.data ?? [])
    .map((row) => mapDbRowToInboxPost(row as Record<string, unknown>))
    .filter((p): p is InboxPost => p !== null)

  return {
    posts,
    total: listResult.count ?? posts.length,
    workspaceTotal: workspaceCount.count ?? 0,
    counts,
    page,
    pageSize: POSTS_PAGE_SIZE,
    error: countError ? 'Could not load post counts. Please refresh the page.' : null,
  }
}
