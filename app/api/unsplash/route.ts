import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || 'business marketing'
  const page = searchParams.get('page') || '1'
  const perPage = searchParams.get('per_page') || '20'

  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    // Return a "not configured" signal so the UI can show the setup prompt
    return NextResponse.json(
      { error: 'UNSPLASH_NOT_CONFIGURED', results: [], total_pages: 0 },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!res.ok) {
      throw new Error(`Unsplash API error: ${res.status}`)
    }

    const data = await res.json()

    // Shape the response — only send what the UI needs
    const results = data.results.map((photo: {
      id: string
      urls: { regular: string; small: string; thumb: string }
      alt_description: string | null
      user: { name: string; links: { html: string } }
    }) => ({
      id: photo.id,
      urls: {
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
      },
      alt_description: photo.alt_description,
      user: {
        name: photo.user.name,
        links: { html: photo.user.links.html },
      },
    }))

    return NextResponse.json({ results, total_pages: data.total_pages })
  } catch (err) {
    console.error('Unsplash fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch photos', results: [], total_pages: 0 }, { status: 500 })
  }
}
