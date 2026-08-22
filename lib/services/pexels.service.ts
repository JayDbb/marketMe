import 'server-only'

import type { StockPhoto } from '@/lib/stock-media'

interface PexelsPhoto {
  id: number
  alt: string | null
  photographer: string
  photographer_url: string
  url: string
  src: {
    large2x: string
    large: string
    medium: string
    small: string
    tiny: string
  }
}

function normalizePhoto(photo: PexelsPhoto): StockPhoto {
  const preview = photo.src.large || photo.src.medium
  return {
    id: String(photo.id),
    urls: {
      regular: photo.src.large2x || photo.src.large,
      preview,
      small: preview,
      thumb: photo.src.medium || photo.src.small,
    },
    alt_description: photo.alt,
    user: {
      name: photo.photographer,
      links: { html: photo.photographer_url },
    },
  }
}

export type PexelsOrientation = 'landscape' | 'portrait' | 'square'

/** Server-side Pexels search — free stock photos, no LLM. */
export async function searchPexelsPhotos(options: {
  query: string
  perPage?: number
  page?: number
  orientation?: PexelsOrientation
}): Promise<{ photos: StockPhoto[]; error?: string }> {
  const apiKey = process.env.PEXELS_API_KEY?.trim()
  if (!apiKey) {
    return { photos: [], error: 'PEXELS_NOT_CONFIGURED' }
  }

  const query = options.query.trim() || 'business lifestyle'
  const perPage = Math.max(1, Math.min(15, options.perPage ?? 3))
  const page = Math.max(1, options.page ?? 1)
  const orientation = options.orientation ?? 'square'

  try {
    const url = new URL('https://api.pexels.com/v1/search')
    url.searchParams.set('query', query)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('orientation', orientation)

    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return { photos: [], error: `Pexels API error: ${res.status}` }
    }

    const data = (await res.json()) as { photos?: PexelsPhoto[] }
    return { photos: (data.photos ?? []).map(normalizePhoto) }
  } catch (err) {
    console.error('Pexels search failed:', err)
    return { photos: [], error: 'Failed to fetch photos' }
  }
}

export async function pickPexelsImageUrl(
  query: string,
  orientation: PexelsOrientation = 'square',
  /** Skip first N results so batch posts get variety */
  offset = 0
): Promise<string | null> {
  const { photos } = await searchPexelsPhotos({
    query,
    perPage: Math.min(15, offset + 3),
    orientation,
  })
  const photo = photos[offset] ?? photos[0]
  return photo?.urls.regular ?? null
}
