'use client'

import { useCallback, useEffect, useState, startTransition, useRef } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { ImageNode } from '@/types/canvas'
import type { StockPhoto } from '@/lib/stock-media'
import { nextZIndex } from '@/lib/canvas-layer-utils'

interface StudioStockPickerProps {
  canvasWidth: number
  canvasHeight: number
  existingZIndex: number
  onAddImage: (layer: ImageNode) => void
}

export function StudioStockPicker({
  canvasWidth,
  canvasHeight,
  existingZIndex,
  onAddImage,
}: StudioStockPickerProps) {
  const [query, setQuery] = useState('instagram aesthetic')
  const [inputVal, setInputVal] = useState('')
  const [photos, setPhotos] = useState<StockPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)
  const layerIdRef = useRef(0)

  const fetchPhotos = useCallback(async (q: string) => {
    setLoading(true)
    const res = await fetch(`/api/pexels?query=${encodeURIComponent(q)}&page=1&per_page=12`)
    const data = await res.json()
    if (data.error === 'PEXELS_NOT_CONFIGURED') {
      setNotConfigured(true)
      setPhotos([])
    } else {
      setNotConfigured(false)
      setPhotos(data.results ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    startTransition(() => {
      void fetchPhotos(query)
    })
  }, [query, fetchPhotos])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputVal || 'instagram aesthetic')
  }

  const addPhoto = (photo: StockPhoto) => {
    layerIdRef.current += 1
    const maxW = canvasWidth * 0.85
    const aspect = 4 / 5
    let w = maxW
    let h = w / aspect
    if (h > canvasHeight * 0.85) {
      h = canvasHeight * 0.85
      w = h * aspect
    }

    const layer: ImageNode = {
      id: `pexels-${photo.id}-${layerIdRef.current}`,
      type: 'image',
      src: photo.urls.regular,
      x: (canvasWidth - w) / 2,
      y: (canvasHeight - h) / 2,
      width: w,
      height: h,
      zIndex: nextZIndex([{ zIndex: existingZIndex } as ImageNode]),
    }
    onAddImage(layer)
  }

  if (notConfigured) {
    return (
      <p className="text-xs text-zinc-500 dark:text-white/40">
        Pexels is not configured. Add PEXELS_API_KEY to your environment.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search Pexels photos…"
          className="pl-8 h-8 text-xs bg-white dark:bg-white/5 border-black/5 dark:border-white/10"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => addPhoto(photo)}
              className="relative aspect-square rounded-lg overflow-hidden border border-black/5 dark:border-white/10 hover:ring-2 hover:ring-blue-500/50 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.urls.preview}
                alt={photo.alt_description ?? 'Stock photo'}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
