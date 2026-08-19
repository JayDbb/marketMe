import type { Post, PostStatus } from '@/types/content'
import { formatTimeRange, DEFAULT_POST_DURATION_MIN } from '@/lib/calendar-utils'

type CanvasLayer = { type?: string; src?: string }
type CanvasData = { layers?: CanvasLayer[] }

export const POST_INBOX_TABS = ['upcoming', 'drafts', 'published', 'failed'] as const
export type PostInboxTab = (typeof POST_INBOX_TABS)[number]

/** @deprecated Use PostInboxTab */
export type PostFilterTab = PostInboxTab | 'all' | 'scheduled' | 'draft' | 'approved'

export const POSTS_PAGE_SIZE = 20

export const POST_INBOX_TAB_STATUSES: Record<PostInboxTab, PostStatus[]> = {
  upcoming: ['scheduled'],
  drafts: ['draft', 'approved', 'rejected'],
  published: ['published'],
  failed: ['failed'],
}

export const POST_INBOX_PLATFORMS = ['instagram'] as const

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending',
  approved: 'Approved',
  published: 'Published',
  scheduled: 'Scheduled',
  failed: 'Failed',
  rejected: 'Rejected',
}

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/20',
  pending_approval: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  published: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25',
  scheduled: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25',
  failed: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/25',
  rejected: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/25',
}

export function getStatusLabel(status: PostStatus | string): string {
  return STATUS_LABELS[status as PostStatus] ?? String(status)
}

export function getStatusStyles(status: PostStatus | string): string {
  return STATUS_STYLES[status as PostStatus] ?? STATUS_STYLES.draft
}

export function extractThumbnail(
  imageUrl?: string | null,
  canvasData?: CanvasData | null
): string | null {
  if (imageUrl) return imageUrl
  if (canvasData?.layers) {
    const imgLayer = canvasData.layers.find((l) => l.type === 'image' && l.src)
    if (imgLayer?.src) return imgLayer.src
  }
  return null
}

export function mapDbRowToPost(
  row: Record<string, unknown>,
  options?: { requireScheduled?: boolean }
): Post | null {
  const scheduledAt = row.scheduled_at as string | null | undefined
  if (options?.requireScheduled && !scheduledAt) return null

  const canvasData = row.canvas_data as CanvasData | null | undefined
  const imageUrl = extractThumbnail(row.image_url as string | null, canvasData)

  return {
    post_id: row.id as string,
    caption: (row.content as string) || '',
    media_url: imageUrl,
    scheduled_date: scheduledAt || '',
    status: row.status as PostStatus,
    social_account: {
      platform: ((row.platform as string) || 'social').toLowerCase(),
    },
  }
}

export type InboxPost = Post & {
  scheduledAt: string | null
  createdAt: string
  errorMessage: string | null
  generationId: string | null
}

export function mapDbRowToInboxPost(row: Record<string, unknown>): InboxPost | null {
  const post = mapDbRowToPost(row)
  if (!post) return null
  return {
    ...post,
    scheduledAt: (row.scheduled_at as string | null) ?? null,
    createdAt: (row.created_at as string) || '',
    errorMessage: (row.error_message as string | null) ?? null,
    generationId: (row.generation_id as string | null) ?? null,
  }
}

export function formatPostDate(iso: string | null | undefined): string {
  if (!iso) return 'Not scheduled'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Not scheduled'
  return formatTimeRange(d, DEFAULT_POST_DURATION_MIN)
}

export function getPlannerDateParam(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parsePostInboxTab(value: string | null | undefined): PostInboxTab {
  if (value && (POST_INBOX_TABS as readonly string[]).includes(value)) {
    return value as PostInboxTab
  }
  return 'upcoming'
}

export function parsePostsPage(value: string | null | undefined): number {
  const n = Number.parseInt(value ?? '1', 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

export function parsePostsPlatform(value: string | null | undefined): string {
  const v = (value ?? 'all').trim().toLowerCase()
  if (v === 'all' || v === '') return 'all'
  if ((POST_INBOX_PLATFORMS as readonly string[]).includes(v)) return v
  return 'all'
}

export function firstSearchParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export function sanitizeSearchQuery(query: string): string {
  return query.trim().slice(0, 120).replace(/[%_,]/g, ' ')
}

export function formatPlatform(platform?: string): string {
  if (!platform) return 'Social'
  const p = platform.toLowerCase()
  if (p === 'twitter') return 'X / Twitter'
  if (p === 'linkedin') return 'LinkedIn'
  if (p === 'instagram') return 'Instagram'
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

export function filterPostsByTab(posts: Post[], tab: PostFilterTab): Post[] {
  if (tab === 'all') return posts
  if (tab === 'upcoming' || tab === 'scheduled') {
    return posts.filter((p) => p.status === 'scheduled')
  }
  if (tab === 'published') return posts.filter((p) => p.status === 'published')
  if (tab === 'drafts' || tab === 'draft' || tab === 'approved') {
    return posts.filter((p) =>
      POST_INBOX_TAB_STATUSES.drafts.includes(p.status)
    )
  }
  if (tab === 'failed') return posts.filter((p) => p.status === 'failed')
  return posts
}

export function filterPostsBySearch(posts: Post[], query: string): Post[] {
  const q = query.trim().toLowerCase()
  if (!q) return posts
  return posts.filter((p) => {
    const platform = p.social_account?.platform?.toLowerCase() ?? ''
    const status = p.status.toLowerCase()
    return (
      p.caption.toLowerCase().includes(q) ||
      platform.includes(q) ||
      status.includes(q)
    )
  })
}

function scheduledTime(post: Post): number | null {
  const raw = 'scheduledAt' in post
    ? (post as InboxPost).scheduledAt
    : post.scheduled_date
  if (!raw) return null
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? null : t
}

export function sortPostsForList(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ta = scheduledTime(a)
    const tb = scheduledTime(b)
    if (ta == null && tb == null) return 0
    if (ta == null) return 1
    if (tb == null) return -1
    return tb - ta
  })
}

export function emptyInboxCopy(tab: PostInboxTab, hasAnyPosts: boolean, hasQuery: boolean): {
  title: string
  body: string
} {
  if (!hasAnyPosts) {
    return {
      title: 'No posts yet',
      body: 'Generate this week’s drafts, then review them here before they hit the calendar.',
    }
  }
  if (hasQuery) {
    return {
      title: 'No posts match this search',
      body: 'Try a different tab, platform, or clear the search.',
    }
  }
  if (tab === 'upcoming') {
    return {
      title: 'Nothing in the queue',
      body: 'Approved posts appear here once they are scheduled. Drafts stay under Drafts until you queue them.',
    }
  }
  if (tab === 'drafts') {
    return {
      title: 'No drafts waiting',
      body: 'Generate a batch or create a post to review captions before they go live.',
    }
  }
  if (tab === 'published') {
    return {
      title: 'No published posts yet',
      body: 'After a post goes live it will show up here.',
    }
  }
  return {
    title: 'No failed publishes',
    body: 'If a scheduled post cannot go live, the error and a Retry action will show here.',
  }
}
