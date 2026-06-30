/** Normalized stock photo shape used by Studio UI (provider-agnostic). */
export interface StockPhoto {
  id: string
  urls: {
    /** Full quality for canvas + saved templates */
    regular: string
    /** Grid / picker preview (~640px+) */
    preview: string
    /** Legacy alias — same as preview */
    small: string
    thumb: string
  }
  alt_description: string | null
  user: { name: string; links: { html: string } }
}

export interface StockPhotoSearchResult {
  results: StockPhoto[]
  total_pages: number
  error?: string
}
