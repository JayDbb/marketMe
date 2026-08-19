'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CanvasMiniPreview } from '@/components/dashboard/studio/canvas-mini-preview'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import {
  STARTER_FORMATS,
  STUDIO_STARTER_TEMPLATES,
  blankCanvasForFormat,
  cloneStarterCanvas,
  formatEmptyLabel,
  getStarterCanvas,
  getStarterCategories,
  starterMatchesFormat,
  type StarterCategory,
  type StarterFormatId,
} from '@/lib/studio-starter-templates'
import { getTemplatePreviewUrl, resolveStudioCategory, templateToCanvas } from '@/lib/studio-utils'
import type { CanvasData } from '@/types/canvas'

interface StudioStarterPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (canvasData: CanvasData, name: string, category: string) => void
  libraryTemplates?: StudioTemplate[]
}

export function StudioStarterPicker({
  open,
  onClose,
  onSelect,
  libraryTemplates = [],
}: StudioStarterPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [formatId, setFormatId] = useState<StarterFormatId>('portrait')
  const [category, setCategory] = useState<StarterCategory | 'All'>('All')

  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setFormatId('portrait')
      setCategory('All')
    }
  }, [open])

  const formatStarters = useMemo(
    () => STUDIO_STARTER_TEMPLATES.filter((starter) => starterMatchesFormat(starter, formatId)),
    [formatId]
  )

  const categoryChips = useMemo(() => getStarterCategories(formatStarters), [formatStarters])

  const filteredStarters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return formatStarters.filter((starter) => {
      if (category !== 'All' && starter.category !== category) return false
      if (!query) return true
      return (
        starter.name.toLowerCase().includes(query) ||
        starter.description.toLowerCase().includes(query)
      )
    })
  }, [formatStarters, category, searchQuery])

  const emptyTitle = useMemo(() => {
    const query = searchQuery.trim()
    if (query) return `No layouts match “${query}”`
    if (category !== 'All') return `No ${category.toLowerCase()} layouts`
    return `No ${formatEmptyLabel(formatId)} layouts`
  }, [searchQuery, category, formatId])

  const showLibrary = libraryTemplates.length > 0 && !searchQuery.trim() && category === 'All'

  const handleBlank = () => {
    onClose()
    onSelect(blankCanvasForFormat(formatId), 'Untitled design', 'Other')
  }

  const handleStarter = (starterId: string, name: string, starterCategory: string) => {
    const starter = STUDIO_STARTER_TEMPLATES.find((item) => item.id === starterId)
    if (!starter) return
    onClose()
    onSelect(cloneStarterCanvas(getStarterCanvas(starter, formatId)), name, starterCategory)
  }

  const handleLibrary = (template: StudioTemplate) => {
    onClose()
    onSelect(
      templateToCanvas(template),
      template.name,
      resolveStudioCategory(template)
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('All')
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-100 bg-black/60 supports-backdrop-filter:backdrop-blur-sm"
        className="z-100 max-w-4xl sm:max-w-4xl gap-0 overflow-hidden overscroll-contain bg-white p-0 font-sans text-zinc-900 ring-zinc-200 dark:bg-[#161b22] dark:text-white dark:ring-white/10"
      >
        <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b border-zinc-200 px-6 py-4 dark:border-white/10">
          <div className="min-w-0 text-left">
            <DialogTitle className="font-sans text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
              Choose a starting layout
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-zinc-500 dark:text-white/40">
              Pick a format, then a layout. Blank starts at the size you selected.
            </DialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleBlank}
              className="inline-flex h-9 items-center rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700 ui-transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-zinc-900 active:scale-[0.97] dark:border-white/10 dark:text-white/80 dark:hover:text-white"
            >
              Start blank
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 ui-transition hover:text-zinc-900 active:scale-[0.97] dark:border-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-3 border-b border-zinc-200 px-6 py-4 dark:border-white/10">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search layouts"
              aria-label="Search layouts"
              autoFocus
              className="h-9 rounded-xl border-zinc-200 bg-white pl-9 text-sm dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Canvas format">
            {STARTER_FORMATS.map((format) => {
              const selected = formatId === format.id
              return (
                <button
                  key={format.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFormatId(format.id)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium ui-transition active:scale-[0.97] ${
                    selected
                      ? 'border border-blue-500/25 bg-blue-500/15 text-blue-400'
                      : 'border border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white/70'
                  }`}
                >
                  {format.label}
                  <span className={selected ? 'text-blue-400/70' : 'text-zinc-400 dark:text-white/30'}>
                    {format.hint}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Layout categories">
            <CategoryChip
              label="All"
              selected={category === 'All'}
              onClick={() => setCategory('All')}
            />
            {categoryChips.map((chip) => (
              <CategoryChip
                key={chip}
                label={chip}
                selected={category === chip}
                onClick={() => setCategory(chip)}
              />
            ))}
          </div>
        </div>

        <div className="custom-scrollbar max-h-[min(60vh,560px)] overflow-y-auto overscroll-contain px-6 py-4">
          {showLibrary ? (
            <section className="mb-6">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-white/35">
                Your templates
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {libraryTemplates.map((template) => (
                  <LibraryCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleLibrary(template)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            {showLibrary ? (
              <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-white/35">
                Starter layouts
              </h3>
            ) : null}

            {filteredStarters.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                {filteredStarters.map((starter) => {
                  const previewData = getStarterCanvas(starter, formatId)
                  return (
                    <button
                      key={starter.id}
                      type="button"
                      onClick={() => handleStarter(starter.id, starter.name, starter.category)}
                      className="group text-left ui-transition active:scale-[0.97]"
                    >
                      <div className="relative overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-zinc-200 ui-transition group-hover:ring-sky-400/60 dark:ring-white/10">
                        <CanvasMiniPreview
                          canvasData={previewData}
                          className="rounded-none border-0"
                        />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-9 items-center justify-center bg-zinc-950/80 text-[11px] font-semibold tracking-wide text-white opacity-0 ui-transition group-hover:opacity-100 group-focus-visible:opacity-100">
                          Use layout
                        </span>
                      </div>
                      <div className="mt-2.5 min-w-0 px-0.5">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                            {starter.name}
                          </p>
                          <span className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-white/8 dark:text-white/45">
                            {starter.category}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500 dark:text-white/40">
                          {starter.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-10 text-center dark:border-white/10">
                <p className="text-sm font-medium text-zinc-800 dark:text-white/80">{emptyTitle}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-white/40">
                  Try another format, or clear the filter.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex h-9 items-center rounded-xl px-3 text-sm font-medium text-blue-400 ui-transition hover:text-blue-300 active:scale-[0.97]"
                >
                  Show all
                </button>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CategoryChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium ui-transition active:scale-[0.97] ${
        selected
          ? 'border border-blue-500/25 bg-blue-500/15 text-blue-400'
          : 'border border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white/60'
      }`}
    >
      {label}
    </button>
  )
}

function LibraryCard({
  template,
  onSelect,
}: {
  template: StudioTemplate
  onSelect: () => void
}) {
  const canvasData =
    template.template_type === 'canvas' && template.canvas_data
      ? template.canvas_data
      : null

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-33 shrink-0 text-left ui-transition active:scale-[0.97]"
    >
      <div className="relative overflow-hidden rounded-xl ring-1 ring-zinc-200 ui-transition group-hover:ring-sky-400/60 dark:ring-white/10">
        {canvasData ? (
          <CanvasMiniPreview canvasData={canvasData} className="rounded-none border-0" />
        ) : (
          <div className="relative aspect-4/5 w-full bg-zinc-100 dark:bg-white/5">
            <Image
              src={getTemplatePreviewUrl(template)}
              alt={template.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-8 items-center justify-center bg-zinc-950/80 text-[11px] font-semibold text-white opacity-0 ui-transition group-hover:opacity-100 group-focus-visible:opacity-100">
          Use layout
        </span>
      </div>
      <p className="mt-1.5 truncate text-xs font-medium text-zinc-700 dark:text-white/75">
        {template.name}
      </p>
    </button>
  )
}
