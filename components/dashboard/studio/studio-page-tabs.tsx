'use client'

import { Plus, X } from 'lucide-react'
import type { CanvasData } from '@/types/canvas'
import { addPage, removePage, switchPage } from '@/lib/canvas-pages'

interface StudioPageTabsProps {
  canvasData: CanvasData
  onChange: (data: CanvasData) => void
}

export function StudioPageTabs({ canvasData, onChange }: StudioPageTabsProps) {
  const pages = canvasData.pages
  if (!pages?.length) return null

  const activeIdx = canvasData.activePageIndex ?? 0

  return (
    <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto custom-scrollbar pb-1">
      {pages.map((page, idx) => (
        <div key={page.id} className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onChange(switchPage(canvasData, idx))}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
              idx === activeIdx
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-200/80 dark:bg-white/8 text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {page.name}
          </button>
          {pages.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(removePage(canvasData, idx))}
              className="w-6 h-6 ml-0.5 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
              title="Remove slide"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange(addPage(canvasData))}
        className="h-8 px-2.5 rounded-lg border border-dashed border-blue-500/40 text-blue-400 hover:bg-blue-500/10 flex items-center gap-1 text-xs font-medium shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
        Add slide
      </button>
    </div>
  )
}
