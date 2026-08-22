'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Sparkles, LayoutTemplate, Loader2 } from 'lucide-react'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { deleteTemplateAction } from '@/app/dashboard/studio/actions'
import { getTemplatePreviewUrl, resolveStudioCategory } from '@/lib/studio-utils'
import { CanvasMiniPreview } from '@/components/dashboard/studio/canvas-mini-preview'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface StudioTemplateCardProps {
  template: StudioTemplate
  onDelete: (id: string) => void
  onEdit: (template: StudioTemplate) => void
}

export function StudioTemplateCard({ template, onDelete, onEdit }: StudioTemplateCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const preview = getTemplatePreviewUrl(template)
  const isCanvas = template.template_type === 'canvas'
  const canvasData = isCanvas ? template.canvas_data : null
  const category = resolveStudioCategory(template)

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    await deleteTemplateAction(template.id, template.file_path, template.source)
    onDelete(template.id)
    setShowDelete(false)
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onEdit(template)}
          className="group text-left ui-transition active:scale-[0.97]"
        >
          <div className="relative overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200 ui-transition group-hover:ring-sky-400/50 dark:bg-white/5 dark:ring-white/10">
            {canvasData ? (
              <CanvasMiniPreview canvasData={canvasData} className="rounded-none border-0" />
            ) : preview ? (
              <div className="relative aspect-4/5 w-full">
                <Image
                  src={preview}
                  alt={template.name}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              </div>
            ) : (
              <div className="aspect-4/5 w-full bg-zinc-200 dark:bg-white/5" />
            )}
            {isCanvas ? (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-sky-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-950">
                <LayoutTemplate className="h-3 w-3" />
                Canvas
              </span>
            ) : null}
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {template.name}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-white/40">{category}</p>
        </button>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/dashboard/generate?templateId=${template.id}`}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 text-[11px] font-semibold text-white ui-transition hover:bg-blue-500 active:scale-[0.97]"
          >
            <Sparkles className="h-3 w-3" />
            Generate
          </Link>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            disabled={deleting}
            aria-label={`Delete ${template.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 ui-transition hover:border-red-500/30 hover:text-red-400 dark:border-white/10"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <Dialog open={showDelete} onOpenChange={(open) => { if (!open) setShowDelete(false) }}>
        <DialogContent
          overlayClassName="z-100 bg-black/60 supports-backdrop-filter:backdrop-blur-sm"
          className="z-100 max-w-sm bg-[#161b22] p-6 font-sans text-white ring-white/10"
        >
          <DialogHeader>
            <DialogTitle className="font-sans text-base font-semibold text-white">
              Delete template
            </DialogTitle>
            <DialogDescription className="text-sm text-white/45">
              “{template.name}” will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowDelete(false)}
              className="h-9 flex-1 rounded-xl border border-white/10 text-sm text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteConfirm()}
              disabled={deleting}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-semibold text-white disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
