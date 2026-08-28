'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { PannablePreviewImage } from './pannable-preview-image'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type InstagramFeedAspect = 'square' | 'portrait' | 'landscape'

export type InstagramFeedPreviewProps = {
  handle: string
  initials: string
  avatarUrl?: string | null
  caption: string
  previewUrl: string | null
  /** Force frame when known; otherwise detect from image. */
  aspect?: InstagramFeedAspect | null
}

const ASPECT_CLASS: Record<InstagramFeedAspect, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[191/100]',
}

const ASPECT_HINT: Record<InstagramFeedAspect, string> = {
  square: '1:1 square',
  portrait: '4:5 portrait (recommended)',
  landscape: '1.91:1 landscape',
}

/** Clamp raw image ratio to Instagram feed-allowed frames. */
export function detectInstagramFeedAspect(
  width: number,
  height: number
): InstagramFeedAspect {
  if (!width || !height) return 'portrait'
  const ratio = width / height
  // IG feed clamps roughly to 1.91:1 … 4:5
  if (ratio >= 1.25) return 'landscape'
  if (ratio <= 0.92) return 'portrait'
  return 'square'
}

function InstagramAvatar({
  avatarUrl,
  initials,
}: {
  avatarUrl?: string | null
  initials: string
}) {
  return (
    <div
      className="size-8 shrink-0 rounded-full bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1.5px]"
      aria-hidden="true"
    >
      <div className="flex size-full items-center justify-center overflow-hidden rounded-full border border-white bg-zinc-100 dark:border-zinc-950 dark:bg-zinc-800">
        {avatarUrl ? (
          // Remote Meta/user avatars vary by host — plain img avoids remotePatterns churn.
          <img src={avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-zinc-800 dark:text-white/80">
            {initials}
          </span>
        )}
      </div>
    </div>
  )
}

function MediaFrame({
  previewUrl,
  aspect,
}: {
  previewUrl: string | null
  aspect: InstagramFeedAspect
}) {
  const frame = ASPECT_CLASS[aspect]

  if (!previewUrl) {
    return (
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 border-y border-zinc-100 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-zinc-900/80 dark:text-white/35',
          frame
        )}
      >
        <ImageIcon className="size-8 opacity-50" aria-hidden="true" />
        <span className="px-4 text-center text-xs">{ASPECT_HINT[aspect]}</span>
      </div>
    )
  }

  return (
    <PannablePreviewImage
      src={previewUrl}
      className={cn('w-full bg-zinc-50 dark:bg-zinc-900', frame)}
      hint="Hold & drag to peek at crop"
    />
  )
}

/**
 * Feed-chrome mock that mirrors Instagram’s post layout closely enough for caption/crop QA.
 * Not a pixel-perfect IG skin — icons are Lucide approximations of the current IG outline set.
 */
export function InstagramFeedPreview({
  handle,
  initials,
  avatarUrl,
  caption,
  previewUrl,
  aspect: aspectProp,
}: InstagramFeedPreviewProps) {
  const [detected, setDetected] = useState<InstagramFeedAspect>('portrait')
  const aspect = aspectProp ?? detected
  const username = handle.replace(/^@/, '') || 'yourbrand'

  useEffect(() => {
    if (aspectProp || !previewUrl) {
      if (!previewUrl && !aspectProp) setDetected('portrait')
      return
    }
    let cancelled = false
    const img = new window.Image()
    img.onload = () => {
      if (cancelled) return
      setDetected(detectInstagramFeedAspect(img.naturalWidth, img.naturalHeight))
    }
    img.onerror = () => {
      if (!cancelled) setDetected('portrait')
    }
    img.src = previewUrl
    return () => {
      cancelled = true
    }
  }, [previewUrl, aspectProp])

  const truncatedCaption =
    caption.trim().length > 220 ? `${caption.trim().slice(0, 217)}…` : caption.trim()

  return (
    <article
      className="flex w-full max-w-[390px] flex-col overflow-hidden border border-zinc-200 bg-white text-zinc-900 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
      aria-label="Instagram feed preview"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <InstagramAvatar avatarUrl={avatarUrl} initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight tracking-tight">
              {username}
            </p>
          </div>
        </div>
        <MoreHorizontal
          className="size-5 shrink-0 text-zinc-900 dark:text-white"
          strokeWidth={2}
          aria-hidden="true"
        />
      </header>

      {/* Media */}
      <MediaFrame previewUrl={previewUrl} aspect={aspect} />

      {/* Actions — Instagram order: like, comment, share | bookmark */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-[18px]">
          <Heart
            className="size-[24px] text-zinc-900 dark:text-white"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <MessageCircle
            className="size-[24px] -scale-x-100 text-zinc-900 dark:text-white"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <Send
            className="size-[22px] text-zinc-900 dark:text-white"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <Bookmark
          className="size-[24px] text-zinc-900 dark:text-white"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>

      {/* Social proof chrome (illustrative for unpublished drafts) */}
      <div className="px-3 pb-1.5 text-[13px] font-semibold leading-snug">
        Liked by <span className="font-semibold">friends</span> and others
      </div>

      {/* Caption */}
      <div className="px-3 pb-1 text-[13px] leading-snug">
        <span className="mr-1.5 font-semibold">{username}</span>
        {truncatedCaption ? (
          <span className="whitespace-pre-wrap font-normal">{truncatedCaption}</span>
        ) : (
          <span className="font-normal text-zinc-400 italic dark:text-white/35">
            Write a caption…
          </span>
        )}
      </div>

      <p className="px-3 pb-3 text-[12px] text-zinc-400 dark:text-white/35">
        View all comments
      </p>
    </article>
  )
}
