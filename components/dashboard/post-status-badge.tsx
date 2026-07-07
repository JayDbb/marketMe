'use client'

import type { PostStatus } from '@/types/content'
import { getStatusLabel, getStatusStyles } from '@/lib/post-utils'
import { cn } from '@/lib/utils'

const COMPACT_LABELS: Partial<Record<PostStatus, string>> = {
  draft: 'Draft',
  approved: 'OK',
  scheduled: 'Queued',
  published: 'Live',
  failed: 'Fail',
  rejected: 'No',
  pending_approval: 'Pending',
}

export function PostStatusBadge({
  status,
  compact = false,
  className,
}: {
  status: PostStatus | string
  compact?: boolean
  className?: string
}) {
  const label = compact
    ? (COMPACT_LABELS[status as PostStatus] ?? getStatusLabel(status))
    : getStatusLabel(status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        getStatusStyles(status),
        className
      )}
    >
      {label}
    </span>
  )
}

/** Calendar event opacity / ring by lifecycle status */
export function getPostStatusEventModifiers(status: PostStatus | string): {
  opacity: string
  ring: string
} {
  switch (status) {
    case 'draft':
    case 'pending_approval':
      return { opacity: 'opacity-75', ring: 'ring-1 ring-white/30 ring-inset' }
    case 'approved':
      return { opacity: 'opacity-90', ring: 'ring-2 ring-emerald-300/50 ring-inset' }
    case 'scheduled':
      return { opacity: 'opacity-100', ring: 'ring-2 ring-amber-300/60 ring-inset' }
    case 'published':
      return { opacity: 'opacity-100', ring: 'ring-2 ring-sky-300/50 ring-inset' }
    case 'failed':
    case 'rejected':
      return { opacity: 'opacity-60', ring: 'ring-2 ring-red-300/40 ring-inset' }
    default:
      return { opacity: 'opacity-85', ring: '' }
  }
}
