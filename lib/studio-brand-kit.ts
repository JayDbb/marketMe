import { INSTAGRAM_BRAND_COLORS } from '@/lib/instagram-formats'

const INDUSTRY_PALETTES: Record<string, string[]> = {
  Fashion: ['#0f172a', '#ffffff', '#ec4899', '#f43f5e', '#fda4af'],
  Food: ['#1c1917', '#fef3c7', '#f59e0b', '#ea580c', '#ffffff'],
  Retail: ['#0f172a', '#3b82f6', '#ffffff', '#f59e0b', '#10b981'],
  Events: ['#1e1b4b', '#8b5cf6', '#ffffff', '#f472b6', '#fde047'],
  Fitness: ['#052e16', '#22c55e', '#ffffff', '#0ea5e9', '#171717'],
  Tech: ['#0d1117', '#3b82f6', '#22d3ee', '#ffffff', '#64748b'],
  Sports: ['#172554', '#2563eb', '#ffffff', '#ef4444', '#fbbf24'],
  Interior: ['#292524', '#d6d3d1', '#78716c', '#ffffff', '#a8a29e'],
}

export interface StudioBrandKit {
  colors: string[]
  fonts: string[]
}

export function getStudioBrandKit(industry?: string | null): StudioBrandKit {
  const palette =
    industry && INDUSTRY_PALETTES[industry]
      ? INDUSTRY_PALETTES[industry]
      : [...INSTAGRAM_BRAND_COLORS]

  return {
    colors: palette,
    fonts: ['Inter', 'Georgia', 'Impact'],
  }
}
