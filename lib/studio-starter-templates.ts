import { resizeCanvasData } from '@/lib/canvas-layer-utils'
import { getInstagramFormat } from '@/lib/instagram-formats'
import type { CanvasData, CircleNode, RectNode, TextNode } from '@/types/canvas'

export type StarterFormatId = 'portrait' | 'square' | 'story'
export type StarterCategory = 'Events' | 'Retail' | 'Tech' | 'Other'

export interface StudioStarterTemplate {
  id: string
  name: string
  description: string
  category: StarterCategory
  /** When set, the layout only appears for these formats. Otherwise it scales to all. */
  formats?: StarterFormatId[]
  build: () => CanvasData
}

export const STARTER_FORMATS: { id: StarterFormatId; label: string; hint: string }[] = [
  { id: 'portrait', label: 'Post', hint: '4:5' },
  { id: 'square', label: 'Square', hint: '1:1' },
  { id: 'story', label: 'Story', hint: '9:16' },
]

const SKY = '#38bdf8'
const INK = '#0d1117'
const CREAM = '#efece4'
const MUTED = '#94a3b8'
const STONE = '#78716c'

function baseCanvas(
  bg: string,
  formatId: StarterFormatId = 'portrait'
): CanvasData['canvas'] {
  const format = getInstagramFormat(formatId)
  return {
    width: format.width,
    height: format.height,
    backgroundColor: bg,
    aspectRatioName: format.aspectRatioName,
  }
}

function text(
  id: string,
  content: string,
  opts: Omit<TextNode, 'id' | 'type' | 'content'>
): TextNode {
  return { id, type: 'text', content, align: 'left', ...opts }
}

function rect(
  id: string,
  opts: Omit<RectNode, 'id' | 'type'>
): RectNode {
  return { id, type: 'rect', ...opts }
}

function circle(
  id: string,
  opts: Omit<CircleNode, 'id' | 'type'>
): CircleNode {
  return { id, type: 'circle', ...opts }
}

export const STUDIO_STARTER_TEMPLATES: StudioStarterTemplate[] = [
  {
    id: 'promo',
    name: 'Promo launch',
    description: 'Drop announcement with a shop bar',
    category: 'Events',
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(INK),
      layers: [
        rect('rail', { x: 0, y: 0, width: 28, height: 1350, fill: SKY, zIndex: 1 }),
        text('kicker', 'NEW DROP', {
          x: 88,
          y: 168,
          width: 900,
          fontSize: 22,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: SKY,
          zIndex: 2,
        }),
        text('headline', 'Now live', {
          x: 88,
          y: 220,
          width: 920,
          fontSize: 118,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: CREAM,
          zIndex: 2,
        }),
        text('subtext', 'Spring collection', {
          x: 88,
          y: 380,
          width: 900,
          fontSize: 42,
          fontFamily: 'Helvetica',
          fill: MUTED,
          zIndex: 2,
        }),
        rect('cta-bar', { x: 0, y: 1168, width: 1080, height: 182, fill: SKY, zIndex: 1 }),
        text('cta', 'Shop the drop', {
          x: 88,
          y: 1228,
          width: 720,
          fontSize: 36,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('cta-arrow', '→', {
          x: 880,
          y: 1224,
          width: 120,
          fontSize: 40,
          fontFamily: 'Helvetica',
          fill: INK,
          align: 'right',
          zIndex: 2,
        }),
      ],
    }),
  },
  {
    id: 'quote',
    name: 'Quote card',
    description: 'Magazine-style testimonial',
    category: 'Other',
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(CREAM),
      layers: [
        rect('rail', { x: 0, y: 0, width: 28, height: 1350, fill: SKY, zIndex: 1 }),
        text('quote-mark', '“', {
          x: 72,
          y: 80,
          width: 200,
          fontSize: 160,
          fontFamily: 'Georgia',
          fill: SKY,
          zIndex: 2,
        }),
        text('headline', 'We booked\nout in two\nweeks.', {
          x: 88,
          y: 360,
          width: 900,
          fontSize: 78,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: INK,
          lineHeight: 1.05,
          zIndex: 2,
        }),
        rect('rule', {
          x: 88,
          y: 1088,
          width: 72,
          height: 6,
          fill: SKY,
          cornerRadius: 3,
          zIndex: 2,
        }),
        text('subtext', 'Maya Chen', {
          x: 88,
          y: 1120,
          width: 900,
          fontSize: 28,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('role', 'Florist · Austin', {
          x: 88,
          y: 1164,
          width: 900,
          fontSize: 24,
          fontFamily: 'Helvetica',
          fill: STONE,
          zIndex: 2,
        }),
      ],
    }),
  },
  {
    id: 'sale',
    name: 'Sale announcement',
    description: 'Giant price lockup for a weekend offer',
    category: 'Retail',
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(INK),
      layers: [
        rect('panel', { x: 0, y: 0, width: 1080, height: 860, fill: CREAM, zIndex: 1 }),
        text('kicker', 'THIS WEEKEND', {
          x: 72,
          y: 72,
          width: 900,
          fontSize: 22,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('headline', '30%', {
          x: 48,
          y: 160,
          width: 980,
          fontSize: 280,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('subtext', 'off everything', {
          x: 72,
          y: 500,
          width: 900,
          fontSize: 48,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: INK,
          zIndex: 2,
        }),
        text('detail', 'In store and online', {
          x: 72,
          y: 960,
          width: 900,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fill: MUTED,
          zIndex: 3,
        }),
        rect('cta', {
          x: 72,
          y: 1128,
          width: 340,
          height: 96,
          fill: SKY,
          cornerRadius: 48,
          zIndex: 3,
        }),
        text('cta-label', 'Shop now', {
          x: 72,
          y: 1156,
          width: 340,
          fontSize: 28,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          align: 'center',
          zIndex: 4,
        }),
      ],
    }),
  },
  {
    id: 'event',
    name: 'Event invite',
    description: 'Date stack plus time and RSVP',
    category: 'Events',
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(INK),
      layers: [
        rect('date-block', { x: 0, y: 0, width: 1080, height: 640, fill: SKY, zIndex: 1 }),
        text('dow', 'SATURDAY', {
          x: 72,
          y: 80,
          width: 900,
          fontSize: 24,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('headline', '12', {
          x: 48,
          y: 120,
          width: 980,
          fontSize: 280,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('month', 'April', {
          x: 72,
          y: 460,
          width: 900,
          fontSize: 42,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: INK,
          zIndex: 2,
        }),
        text('kicker', 'YOU’RE INVITED', {
          x: 72,
          y: 720,
          width: 900,
          fontSize: 22,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: SKY,
          zIndex: 2,
        }),
        text('title', 'Open studio', {
          x: 72,
          y: 768,
          width: 920,
          fontSize: 72,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: CREAM,
          zIndex: 2,
        }),
        text('subtext', '7–10 PM · 214 Oak Street', {
          x: 72,
          y: 880,
          width: 900,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fill: MUTED,
          zIndex: 2,
        }),
        rect('cta', {
          x: 72,
          y: 1148,
          width: 280,
          height: 88,
          fill: SKY,
          cornerRadius: 44,
          zIndex: 2,
        }),
        text('cta-label', 'RSVP', {
          x: 72,
          y: 1174,
          width: 280,
          fontSize: 26,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          align: 'center',
          zIndex: 3,
        }),
      ],
    }),
  },
  {
    id: 'minimal',
    name: 'Minimal tip',
    description: 'Three-beat educational carousel cover',
    category: 'Tech',
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(CREAM),
      layers: [
        text('kicker', 'SAVE THIS', {
          x: 72,
          y: 80,
          width: 900,
          fontSize: 22,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: SKY,
          zIndex: 1,
        }),
        text('headline', '3 ways to\nget more saves', {
          x: 72,
          y: 128,
          width: 920,
          fontSize: 56,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: INK,
          lineHeight: 1.1,
          zIndex: 1,
        }),
        rect('row-1', {
          x: 72,
          y: 520,
          width: 936,
          height: 200,
          fill: '#e7e2d6',
          cornerRadius: 24,
          zIndex: 1,
        }),
        text('n1', '01', {
          x: 104,
          y: 584,
          width: 120,
          fontSize: 36,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: SKY,
          zIndex: 2,
        }),
        text('t1', 'Post when they are online', {
          x: 240,
          y: 592,
          width: 720,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        rect('row-2', {
          x: 72,
          y: 744,
          width: 936,
          height: 200,
          fill: '#e7e2d6',
          cornerRadius: 24,
          zIndex: 1,
        }),
        text('n2', '02', {
          x: 104,
          y: 808,
          width: 120,
          fontSize: 36,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: SKY,
          zIndex: 2,
        }),
        text('t2', 'Reply in the first hour', {
          x: 240,
          y: 816,
          width: 720,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        rect('row-3', {
          x: 72,
          y: 968,
          width: 936,
          height: 200,
          fill: '#e7e2d6',
          cornerRadius: 24,
          zIndex: 1,
        }),
        text('n3', '03', {
          x: 104,
          y: 1032,
          width: 120,
          fontSize: 36,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: SKY,
          zIndex: 2,
        }),
        text('t3', 'Write a save-worthy caption', {
          x: 240,
          y: 1040,
          width: 720,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
      ],
    }),
  },
  {
    id: 'sale-square',
    name: 'Flash sale',
    description: 'Centered price for a square feed post',
    category: 'Retail',
    formats: ['square'],
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(INK, 'square'),
      layers: [
        rect('panel', { x: 0, y: 0, width: 1080, height: 760, fill: CREAM, zIndex: 1 }),
        text('kicker', 'TODAY ONLY', {
          x: 72,
          y: 64,
          width: 900,
          fontSize: 22,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('headline', '50%', {
          x: 40,
          y: 120,
          width: 1000,
          fontSize: 240,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('subtext', 'off the drop', {
          x: 72,
          y: 420,
          width: 900,
          fontSize: 44,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: INK,
          zIndex: 2,
        }),
        rect('cta', {
          x: 72,
          y: 880,
          width: 340,
          height: 96,
          fill: SKY,
          cornerRadius: 48,
          zIndex: 2,
        }),
        text('cta-label', 'Shop now', {
          x: 72,
          y: 908,
          width: 340,
          fontSize: 28,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          align: 'center',
          zIndex: 3,
        }),
      ],
    }),
  },
  {
    id: 'quote-story',
    name: 'Story quote',
    description: 'Full-height testimonial for Stories',
    category: 'Other',
    formats: ['story'],
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(CREAM, 'story'),
      layers: [
        rect('rail', { x: 0, y: 0, width: 28, height: 1920, fill: SKY, zIndex: 1 }),
        text('kicker', 'KIND WORDS', {
          x: 88,
          y: 220,
          width: 900,
          fontSize: 22,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: SKY,
          zIndex: 2,
        }),
        text('quote-mark', '“', {
          x: 72,
          y: 280,
          width: 240,
          fontSize: 180,
          fontFamily: 'Georgia',
          fill: SKY,
          zIndex: 2,
        }),
        text('headline', 'We booked\nout in two\nweeks.', {
          x: 88,
          y: 560,
          width: 900,
          fontSize: 72,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: INK,
          lineHeight: 1.08,
          zIndex: 2,
        }),
        rect('rule', {
          x: 88,
          y: 1560,
          width: 72,
          height: 6,
          fill: SKY,
          cornerRadius: 3,
          zIndex: 2,
        }),
        text('subtext', 'Maya Chen', {
          x: 88,
          y: 1592,
          width: 900,
          fontSize: 28,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
        text('role', 'Florist · Austin', {
          x: 88,
          y: 1636,
          width: 900,
          fontSize: 24,
          fontFamily: 'Helvetica',
          fill: STONE,
          zIndex: 2,
        }),
      ],
    }),
  },
  {
    id: 'tip-story',
    name: 'Story tip',
    description: 'Single teaching beat for Stories',
    category: 'Tech',
    formats: ['story'],
    build: () => ({
      version: '1.0',
      canvas: baseCanvas(INK, 'story'),
      layers: [
        rect('top', { x: 0, y: 0, width: 1080, height: 28, fill: SKY, zIndex: 1 }),
        circle('badge', {
          x: 88,
          y: 280,
          width: 120,
          height: 120,
          fill: SKY,
          zIndex: 2,
        }),
        text('kicker', '01', {
          x: 88,
          y: 312,
          width: 120,
          fontSize: 36,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          align: 'center',
          zIndex: 3,
        }),
        text('headline', 'Reply in\nthe first\nhour', {
          x: 88,
          y: 460,
          width: 900,
          fontSize: 88,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: CREAM,
          lineHeight: 1.05,
          zIndex: 2,
        }),
        text('subtext', 'Early replies train\nthe algorithm to show\nyour post to more people\nalready watching.', {
          x: 88,
          y: 920,
          width: 900,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fill: MUTED,
          lineHeight: 1.35,
          zIndex: 2,
        }),
        rect('cta-bar', { x: 0, y: 1740, width: 1080, height: 180, fill: SKY, zIndex: 1 }),
        text('cta', 'Swipe for 02', {
          x: 88,
          y: 1804,
          width: 900,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fontStyle: 'bold',
          fill: INK,
          zIndex: 2,
        }),
      ],
    }),
  },
]

const starterCanvasCache = new Map<string, CanvasData>()

export function starterMatchesFormat(
  starter: StudioStarterTemplate,
  formatId: StarterFormatId
): boolean {
  if (!starter.formats?.length) return true
  return starter.formats.includes(formatId)
}

export function getStarterCategories(starters: StudioStarterTemplate[]): StarterCategory[] {
  const present = new Set(starters.map((starter) => starter.category))
  const order: StarterCategory[] = ['Events', 'Retail', 'Tech', 'Other']
  return order.filter((category) => present.has(category))
}

export function getStarterCanvas(
  starter: StudioStarterTemplate,
  formatId: StarterFormatId
): CanvasData {
  const key = `${starter.id}:${formatId}`
  const cached = starterCanvasCache.get(key)
  if (cached) return cached

  const format = getInstagramFormat(formatId)
  const data = resizeCanvasData(starter.build(), format)
  starterCanvasCache.set(key, data)
  return data
}

export function cloneStarterCanvas(data: CanvasData): CanvasData {
  return JSON.parse(JSON.stringify(data)) as CanvasData
}

export function blankCanvasForFormat(formatId: StarterFormatId): CanvasData {
  const format = getInstagramFormat(formatId)
  return {
    version: '1.0',
    canvas: {
      width: format.width,
      height: format.height,
      backgroundColor: INK,
      aspectRatioName: format.aspectRatioName,
    },
    layers: [],
  }
}

export function formatEmptyLabel(formatId: StarterFormatId): string {
  if (formatId === 'story') return 'story'
  if (formatId === 'square') return 'square'
  return 'post'
}
