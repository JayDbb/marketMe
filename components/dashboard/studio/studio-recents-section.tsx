'use client'

import Image from 'next/image'
import { Clock, LayoutTemplate, Pencil } from 'lucide-react'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { getTemplatePreviewUrl } from '@/lib/studio-utils'
import { formatDistanceToNow } from '@/lib/social/format-relative'

interface StudioRecentsSectionProps {
  items: { template: StudioTemplate; openedAt: string }[]
  onOpen: (template: StudioTemplate) => void
}

export function StudioRecentsSection({ items, onOpen }: StudioRecentsSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/3 px-4 py-3">
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
  const preview = getTemplatePreviewUrl(template)
  const isCanvas = template.template_type === 'canvas'
  const relative = formatDistanceToNow(openedAt)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group shrink-0 w-32 snap-start text-left rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden hover:border-blue-500/30 transition-all"
    >
      <div className="relative aspect-[4/5] bg-zinc-100 dark:bg-white/5">
        <Image
          src={preview}
          alt={template.name}
          fill
          unoptimized
          className="object-cover"
          sizes="128px"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-1.5 left-1.5">
          {isCanvas ? (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-500/25 text-[8px] font-semibold uppercase tracking-wide text-blue-100">
              <LayoutTemplate className="w-2 h-2" />
              Canvas
            </span>
          ) : null}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-600 text-white text-[10px] font-semibold">
            <Pencil className="w-2.5 h-2.5" />
            Open
          </span>
        </div>
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[11px] font-medium text-zinc-900 dark:text-white truncate">{template.name}</p>
        {relative && (
          <p className="text-[9px] text-zinc-500 dark:text-white/35">
            {relative === 'just now' ? 'Just now' : `${relative} ago`}
          </p>
        )}
      </div>
    </button>
  )
}
