'use client'

import { useState, useCallback, useEffect, useMemo, startTransition } from 'react'
import { Search, Bookmark, CheckCircle2, Loader2, Key, ExternalLink, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { savePexelsTemplateAction } from '@/app/dashboard/studio/actions'
import type { StockPhoto } from '@/lib/stock-media'
import { toast } from 'sonner'

export function StudioStockGrid({
  savedIds,
  onSave,
  onOpenInEditor,
}: {
  savedIds: Set<string>
  onSave: (template: StudioTemplate) => void
  onOpenInEditor: (photo: StockPhoto, template?: StudioTemplate) => void
}) {
  const [query, setQuery] = useState('small business marketing')
  const [inputVal, setInputVal] = useState('')
  const [photos, setPhotos] = useState<StockPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [notConfigured, setNotConfigured] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [extraSavedIds, setExtraSavedIds] = useState<string[]>([])
  const localSaved = useMemo(
    () => new Set([...savedIds, ...extraSavedIds]),
    [savedIds, extraSavedIds]
  )

  const fetchPhotos = useCallback(async (q: string, p: number) => {
    setLoading(true)
    const res = await fetch(`/api/pexels?query=${encodeURIComponent(q)}&page=${p}&per_page=18`)
    const data = await res.json()
    if (data.error === 'PEXELS_NOT_CONFIGURED') {
      setNotConfigured(true)
      setLoading(false)
      return
    }
    setNotConfigured(false)
    setPhotos(data.results ?? [])
    setTotalPages(data.total_pages ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    startTransition(() => {
      void fetchPhotos(query, page)
    })
  }, [query, page, fetchPhotos])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setQuery(inputVal || 'small business marketing')
  }

  const handleSave = async (photo: StockPhoto) => {
    setSavingId(photo.id)
    const result = await savePexelsTemplateAction({
      name: photo.alt_description || `Photo by ${photo.user.name}`,
      category: 'Pexels',
      file_url: photo.urls.regular,
      pexels_id: photo.id,
      author_name: photo.user.name,
      author_url: photo.user.links.html,
    })
    setSavingId(null)
    if (!result.success) {
      toast.error(result.error ?? 'Failed to save')
      return
    }
    setExtraSavedIds((prev) => (prev.includes(photo.id) ? prev : [...prev, photo.id]))
    if (result.template) onSave(result.template)
    toast.success('Saved to your library', {
      action: {
        label: 'Open in editor',
        onClick: () => onOpenInEditor(photo, result.template),
      },
    })
  }

  if (notConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Key className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Pexels not configured</h3>
        <p className="text-sm text-zinc-500 dark:text-white/40 max-w-sm">
          Add <code className="text-amber-400 bg-white/5 px-1 rounded">PEXELS_API_KEY</code> to{' '}
          <code className="text-white/60 bg-white/5 px-1 rounded">.env.local</code> to browse stock photos.
        </p>
        <a
          href="https://www.pexels.com/api/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-400/20 bg-blue-500/8 px-4 py-2 rounded-xl"
        >
          Get API key <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search photos (coffee shop, fitness…)"
            className="pl-10 h-10 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl text-sm"
          />
        </div>
        <Button type="submit" className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400/50 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {photos.map((photo) => {
              const isSaved = localSaved.has(photo.id)
              return (
                <div
                  key={photo.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenInEditor(photo)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpenInEditor(photo)
                    }
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-white/8 cursor-pointer"
                >
                  <img
                    src={photo.urls.preview}
                    alt={photo.alt_description ?? ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-lg">
                      <Pencil className="w-3 h-3" />
                      Open in editor
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-[9px] text-white/60 truncate">{photo.user.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleSave(photo)
                    }}
                    disabled={savingId === photo.id || isSaved}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-lg backdrop-blur-sm border flex items-center justify-center transition-all ${
                      isSaved
                        ? 'bg-green-600/80 border-green-500/50 text-white'
                        : 'bg-black/50 border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-600/80'
                    }`}
                  >
                    {savingId === photo.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSaved ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-xs disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-xs text-zinc-500 font-mono">
                Page {page} of {Math.min(totalPages, 20)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= Math.min(totalPages, 20)}
                className="h-8 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}

          <p className="text-[10px] text-zinc-400 dark:text-white/30 text-center mt-4">
            Photos provided by{' '}
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline">
              Pexels
            </a>
          </p>
        </>
      )}
    </div>
  )
}
