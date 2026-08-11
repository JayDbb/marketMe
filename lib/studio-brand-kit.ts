import { INSTAGRAM_BRAND_COLORS } from '@/lib/instagram-formats'
import type { SmbIndustry } from '@/lib/industries'
import { normalizeIndustry } from '@/lib/industries'

const INDUSTRY_PALETTES: Record<SmbIndustry, string[]> = {
  'Barber & Salon': ['#0f172a', '#f8fafc', '#3b82f6', '#94a3b8', '#1e293b'],
  Beauty: ['#1e1b4b', '#ffffff', '#ec4899', '#f9a8d4', '#a78bfa'],
  'Food & Beverage': ['#1c1917', '#fef3c7', '#f59e0b', '#ea580c', '#ffffff'],
  Fashion: ['#0f172a', '#ffffff', '#ec4899', '#f43f5e', '#fda4af'],
  Retail: ['#0f172a', '#3b82f6', '#ffffff', '#f59e0b', '#10b981'],
  Fitness: ['#052e16', '#22c55e', '#ffffff', '#0ea5e9', '#171717'],
  'Health & Wellness': ['#042f2e', '#99f6e4', '#14b8a6', '#ffffff', '#0f766e'],
  Events: ['#1e1b4b', '#8b5cf6', '#ffffff', '#f472b6', '#fde047'],
  'Professional Services': ['#0f172a', '#e2e8f0', '#2563eb', '#64748b', '#ffffff'],
  Tech: ['#0d1117', '#3b82f6', '#22d3ee', '#ffffff', '#64748b'],
  Sports: ['#172554', '#2563eb', '#ffffff', '#ef4444', '#fbbf24'],
  Interior: ['#292524', '#d6d3d1', '#78716c', '#ffffff', '#a8a29e'],
  Education: ['#1e3a5f', '#dbeafe', '#3b82f6', '#ffffff', '#f59e0b'],
  'Home Services': ['#14532d', '#fef08a', '#22c55e', '#ffffff', '#0ea5e9'],
  Other: [...INSTAGRAM_BRAND_COLORS],
}

export interface StudioBrandKit {
  colors: string[]
  fonts: string[]
  logoUrl?: string | null
}

function parseHexColors(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null
  const colors = raw
    .filter((c): c is string => typeof c === 'string')
    .map((c) => c.trim())
    .filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c))
    .slice(0, 5)
  return colors.length > 0 ? colors : null
}

function parseFonts(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null
  const fonts = raw
    .filter((f): f is string => typeof f === 'string')
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, 3)
  return fonts.length > 0 ? fonts : null
}

export function getIndustryPalette(industry?: string | null): string[] {
  const normalized = normalizeIndustry(industry)
  if (normalized && INDUSTRY_PALETTES[normalized]) {
    return [...INDUSTRY_PALETTES[normalized]]
  }
  return [...INSTAGRAM_BRAND_COLORS]
}

/**
 * Prefer persisted brand assets on the profile; fall back to industry palette.
 */
export function getStudioBrandKit(
  industry?: string | null,
  brand?: {
    brandColors?: unknown
    brandFonts?: unknown
    logoUrl?: string | null
  } | null
): StudioBrandKit {
  const profileColors = parseHexColors(brand?.brandColors)
  const profileFonts = parseFonts(brand?.brandFonts)

  return {
    colors: profileColors ?? getIndustryPalette(industry),
    fonts: profileFonts ?? ['Inter', 'Georgia', 'Impact'],
    logoUrl: brand?.logoUrl ?? null,
  }
}
