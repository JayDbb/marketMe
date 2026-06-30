import { NextRequest, NextResponse } from 'next/server'
import type { StockPhoto } from '@/lib/stock-media'

export const runtime = 'edge'

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || 'business marketing'
  const page = searchParams.get('page') || '1'
  const perPage = searchParams.get('per_page') || '20'

  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'PEXELS_NOT_CONFIGURED', results: [], total_pages: 0 },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=portrait`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      throw new Error(`Pexels API error: ${res.status}`)
    }

    const data = (await res.json()) as {
      photos: PexelsPhoto[]
      total_results: number
      per_page: number
    }

    const results = data.photos.map(normalizePhoto)
    const totalPages = Math.ceil(data.total_results / data.per_page)

    return NextResponse.json({ results, total_pages: totalPages })
  } catch (err) {
    console.error('Pexels fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch photos', results: [], total_pages: 0 },
      { status: 500 }
    )
  }
}
