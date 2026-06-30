import type { Post, PostStatus } from '@/types/content'
import { formatTimeRange, DEFAULT_POST_DURATION_MIN } from '@/lib/calendar-utils'

type CanvasLayer = { type?: string; src?: string }
type CanvasData = { layers?: CanvasLayer[] }

export type PostFilterTab = 'all' | 'scheduled' | 'published' | 'draft' | 'failed'

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending',
  approved: 'Approved',
  published: 'Published',
  scheduled: 'Scheduled',
  failed: 'Failed',
}

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/20',
  pending_approval: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  published: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25',
  scheduled: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25',
  failed: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/25',
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
    scheduled_date: scheduledAt || new Date().toISOString(),
    status: row.status as PostStatus,
    social_account: {
      platform: ((row.platform as string) || 'social').toLowerCase(),
    },
  }
}

export function formatPostDate(iso: string | null | undefined): string {
  if (!iso) return 'Not scheduled'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Not scheduled'
  const end = new Date(d.getTime() + DEFAULT_POST_DURATION_MIN * 60_000)
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

export function filterPostsByTab(posts: Post[], tab: PostFilterTab): Post[] {
  if (tab === 'all') return posts
  if (tab === 'scheduled') return posts.filter((p) => p.status === 'scheduled')
  if (tab === 'published') return posts.filter((p) => p.status === 'published')
  if (tab === 'draft') return posts.filter((p) => p.status === 'draft')
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

export function sortPostsForList(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ta = new Date(a.scheduled_date).getTime()
    const tb = new Date(b.scheduled_date).getTime()
    return tb - ta
  })
}
