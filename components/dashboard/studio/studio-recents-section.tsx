'use client'

import Image from 'next/image'
import { Clock, LayoutTemplate } from 'lucide-react'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { getTemplatePreviewUrl } from '@/lib/studio-utils'
import { CanvasMiniPreview } from '@/components/dashboard/studio/canvas-mini-preview'
import { formatDistanceToNow } from '@/lib/social/format-relative'

interface StudioRecentsSectionProps {
  items: { template: StudioTemplate; openedAt: string }[]
  onOpen: (template: StudioTemplate) => void
}

export function StudioRecentsSection({ items, onOpen }: StudioRecentsSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#161b22]">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-blue-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-white/60">
          Recent saves
        </h2>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar snap-x snap-mandatory">
        {items.map(({ template, openedAt }) => (
          <RecentCard
            key={template.id}
            template={template}
            openedAt={openedAt}
            onOpen={() => onOpen(template)}
          />
        ))}
      </div>
    </section>
  )
}

function RecentCard({
  template,
  openedAt,
  onOpen,
}: {
  template: StudioTemplate
  openedAt: string
  onOpen: () => void
}) {
  const isCanvas = template.template_type === 'canvas'
  const canvasData = isCanvas ? template.canvas_data : null
  const preview = getTemplatePreviewUrl(template)
  const relative = formatDistanceToNow(openedAt)

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${template.name}`}
      className="group w-32 shrink-0 snap-start text-left ui-transition hover:opacity-90 active:scale-[0.97]"
    >
      <div className="relative overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">
        {canvasData ? (
          <CanvasMiniPreview canvasData={canvasData} className="rounded-none border-0" />
        ) : preview ? (
          <div className="relative aspect-4/5 w-full">
            <Image
              src={preview}
              alt=""
              fill
              unoptimized
              className="object-contain"
              sizes="128px"
            />
          </div>
        ) : (
          <div className="aspect-4/5 w-full bg-zinc-200 dark:bg-white/5" />
        )}
        {isCanvas ? (
          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 rounded bg-sky-500/90 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-zinc-950">
            <LayoutTemplate className="h-2 w-2" />
            Canvas
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="truncate text-[11px] font-medium text-zinc-900 dark:text-white">{template.name}</p>
        {relative ? (
          <p className="text-[9px] text-zinc-500 dark:text-white/35">
            {relative === 'just now' ? 'Just now' : `${relative} ago`}
          </p>
        ) : null}
      </div>
    </button>
  )
}
