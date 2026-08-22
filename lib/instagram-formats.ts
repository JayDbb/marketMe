import type { CanvasData } from '@/types/canvas'

export type InstagramFormatId =
  | 'square'
  | 'portrait'
  | 'portrait-grid'
  | 'story'
  | 'landscape'

export interface InstagramFormat {
  id: InstagramFormatId
  label: string
  subtitle: string
  width: number
  height: number
  aspectRatioName: CanvasData['canvas']['aspectRatioName']
  /** Recommended default for Instagram feed posts */
  recommended?: boolean
}

/** Standard Instagram dimensions (1080px wide) — aligned with Canva presets */
export const INSTAGRAM_FORMATS: InstagramFormat[] = [
  {
    id: 'portrait',
    label: 'Portrait Post',
    subtitle: '4:5 · 1080×1350',
    width: 1080,
    height: 1350,
    aspectRatioName: 'portrait',
    recommended: true,
  },
  {
    id: 'square',
    label: 'Square Post',
    subtitle: '1:1 · 1080×1080',
    width: 1080,
    height: 1080,
    aspectRatioName: 'square',
  },
  {
    id: 'portrait-grid',
    label: 'Grid Portrait',
    subtitle: '3:4 · 1080×1440',
    width: 1080,
    height: 1440,
    aspectRatioName: 'portrait',
  },
  {
    id: 'story',
    label: 'Story / Reel',
    subtitle: '9:16 · 1080×1920',
    width: 1080,
    height: 1920,
    aspectRatioName: 'story',
  },
  {
    id: 'landscape',
    label: 'Landscape',
    subtitle: '1.91:1 · 1080×566',
    width: 1080,
    height: 566,
    aspectRatioName: 'custom',
  },
]

export const INSTAGRAM_BRAND_COLORS = [
  '#ffffff',
  '#0f172a',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#ef4444',
] as const

export const STUDIO_FONT_FAMILIES = [
  'Inter',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Helvetica',
  'Verdana',
  'Courier New',
  'Impact',
] as const

export function getInstagramFormat(id: InstagramFormatId): InstagramFormat {
  return INSTAGRAM_FORMATS.find((f) => f.id === id) ?? INSTAGRAM_FORMATS[0]
}
