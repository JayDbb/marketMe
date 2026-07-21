'use client'

import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useIsClient } from '@/hooks/use-is-client'
import { STUDIO_STARTER_TEMPLATES } from '@/lib/studio-starter-templates'
import { CanvasMiniPreview } from '@/components/dashboard/studio/canvas-mini-preview'
import type { CanvasData } from '@/types/canvas'

interface StudioStarterPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (canvasData: CanvasData, name: string, category: string) => void
}

export function StudioStarterPicker({ open, onClose, onSelect }: StudioStarterPickerProps) {
  const isClient = useIsClient()

  if (!open || !isClient) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-starter-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-white/10">
          <div>
            <h2
              id="studio-starter-title"
              className="text-lg font-bold text-zinc-900 dark:text-white"
            >
              Start from a template
            </h2>
            <p className="text-xs text-zinc-500 dark:text-white/40 mt-0.5">
              Pick a starter layout or start blank
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => {
              onClose()
              onSelect(
                {
                  version: '1.0',
                  canvas: {
                    width: 1080,
                    height: 1350,
                    backgroundColor: '#0d1117',
                    aspectRatioName: 'portrait',
                  },
                  layers: [],
                },
                'Untitled design',
                'Other'
              )
            }}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-white/15 hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors min-h-[140px]"
          >
            <div className="w-10 h-12 rounded-md border border-zinc-300 dark:border-white/20 bg-zinc-100 dark:bg-white/5" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-white/80">Blank canvas</span>
          </button>

          {STUDIO_STARTER_TEMPLATES.map((starter) => {
            const previewData = starter.build()

            return (
              <button
                key={starter.id}
                type="button"
                onClick={() => {
                  onClose()
                  onSelect(previewData, starter.name, starter.category)
                }}
                className="flex flex-col gap-2 p-3 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors text-left"
              >
                <CanvasMiniPreview canvasData={previewData} />
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {starter.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-white/40 line-clamp-2">
                    {starter.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}
