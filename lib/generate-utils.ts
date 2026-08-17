import { toDatetimeLocalValue } from '@/lib/calendar-utils'
import { parseDatetimeLocal } from '@/lib/post-schedule-utils'
import type { CanvasData } from '@/types/canvas'

export interface GenerateSetupInput {
  businessName: string
  goal: string
  platform: string
  numPosts: number
  tone: string
}

export interface GeneratedPostDraft {
  id: string
  title: string
  caption: string
  hashtags: string
  scheduledDate: string
  status: 'needs_review'
}

export interface GenerateContext {
  businessName: string
  industry: string
  services: string
  location: string
  defaultTone: string
  defaultGoal: string
  defaultPlatform: string
  /** True when onboarding profile fields will seed generation prompts. */
  usesOnboardingBrandKit?: boolean
  /** Which learning layers are active for this workspace. */
  learningLayers?: {
    brandMemory: boolean
    insights: boolean
    insightsStatus: string
  }
  /** True when MarketMe AI API and/or OpenAI/OpenRouter is configured. */
  hasLiveAi: boolean
  /** @deprecated Use hasLiveAi */
  hasOpenAI: boolean
  aiProvider: 'marketme-api' | 'openai' | 'none'
  preferredAiProvider: 'auto' | 'marketme-api' | 'openai'
  captionModel: string
  captionModelLabel: string
  templateCount: number
  /** Studio template id → times used on approved/scheduled/published posts */
  templateUsageCounts: Record<string, number>
  creditsBalance: number
  creditsLimit: number | null
  creditCostPerGeneration: number
}

export function normalizePlatform(platform: string): string {
  const key = platform.trim().toLowerCase()
  if (key === 'x' || key === 'twitter' || key === 'x / twitter') return 'twitter'
  if (key === 'linkedin') return 'linkedin'
  if (key === 'instagram') return 'instagram'
  if (key === 'facebook') return 'facebook'
  return key || 'instagram'
}

export function toIsoScheduledDate(value: string): string {
  const d = parseDatetimeLocal(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid scheduled date')
  }
  if (d.getTime() <= Date.now()) {
    throw new Error('Scheduled time must be in the future')
  }
  return d.toISOString()
}

/** Spread posts across the next 7 days (weekday mornings/afternoons). */
export function buildScheduleDates(count: number): string[] {
  const slots = [
    { dayOffset: 1, hour: 10, minute: 0 },
    { dayOffset: 2, hour: 14, minute: 30 },
    { dayOffset: 3, hour: 9, minute: 0 },
    { dayOffset: 4, hour: 18, minute: 0 },
    { dayOffset: 5, hour: 11, minute: 30 },
    { dayOffset: 6, hour: 16, minute: 0 },
    { dayOffset: 7, hour: 10, minute: 0 },
  ]

  return Array.from({ length: Math.min(count, 14) }, (_, i) => {
    const slot = slots[i % slots.length]
    const extraWeek = Math.floor(i / slots.length) * 7
    const d = new Date()
    d.setDate(d.getDate() + slot.dayOffset + extraWeek)
    d.setHours(slot.hour, slot.minute, 0, 0)
    return toDatetimeLocalValue(d)
  })
}

const GOAL_ANGLES: Record<string, { title: string; caption: string; hashtags: string }[]> = {
  'Increase Brand Awareness': [
    {
      title: 'Brand Story Spotlight',
      caption:
        'Behind every great brand is a story worth sharing. Here is what drives us every day — and why it matters to you.',
      hashtags: '#BrandStory #SmallBusiness #Community #BuildInPublic',
    },
    {
      title: 'Values That Guide Us',
      caption:
        'We built this for people who care about quality and authenticity. If that sounds like you, you are in the right place.',
      hashtags: '#BrandValues #Authenticity #Trust #Marketing',
    },
    {
      title: 'Meet the Team',
      caption:
        'Real people, real passion. Meet the team making it happen — and say hi in the comments.',
      hashtags: '#TeamSpotlight #BehindTheScenes #CompanyCulture',
    },
  ],
  'Lead Generation': [
    {
      title: 'Problem → Solution',
      caption:
        'Still juggling manual marketing tasks? Here is a simpler way to stay consistent without burning out.',
      hashtags: '#LeadGen #MarketingTips #Automation #Growth',
    },
    {
      title: 'Free Resource Drop',
      caption:
        'We put together a quick checklist to help you plan a week of content in under an hour. Link in bio.',
      hashtags: '#FreeResource #ContentStrategy #Leads #Download',
    },
    {
      title: 'Social Proof',
      caption:
        'Nothing beats hearing it from customers who have been there. Here is what they are saying about working with us.',
      hashtags: '#Testimonial #SocialProof #Results #B2B',
    },
  ],
  'Community Engagement': [
    {
      title: 'Question of the Day',
      caption:
        'Quick question for you: what is the one marketing task you wish you could automate today?',
      hashtags: '#Community #Question #Engagement #SocialMedia',
    },
    {
      title: 'Poll Worth Answering',
      caption:
        'Team morning post or evening post — when does your audience actually show up? Drop your vote below.',
      hashtags: '#Poll #Audience #Engagement #ContentTips',
    },
    {
      title: 'Celebrate a Win',
      caption:
        'Shoutout to everyone showing up consistently this week. Small steps compound — keep going.',
      hashtags: '#CommunityWin #Motivation #CreatorEconomy',
    },
  ],
  'Product Launch': [
    {
      title: 'Launch Teaser',
      caption:
        'Something new is almost here. We have been building in the background — and you will want to see this.',
      hashtags: '#ComingSoon #ProductLaunch #NewRelease #Startup',
    },
    {
      title: 'Feature Highlight',
      caption:
        'Designed to save you hours every week. Here is the feature we are most excited for you to try first.',
      hashtags: '#FeatureDrop #SaaS #ProductMarketing #Launch',
    },
    {
      title: 'Launch Day',
      caption:
        'It is live. Thank you for the early support — explore what is new and tell us what you think.',
      hashtags: '#LaunchDay #NowLive #ProductUpdate #Feedback',
    },
  ],
}

const DEFAULT_ANGLES = GOAL_ANGLES['Increase Brand Awareness']

export function buildFallbackPosts(input: GenerateSetupInput): GeneratedPostDraft[] {
  const angles = GOAL_ANGLES[input.goal] ?? DEFAULT_ANGLES
  const dates = buildScheduleDates(input.numPosts)
  const platformTag = normalizePlatform(input.platform)
  const toneNote = input.tone.trim() ? ` Tone: ${input.tone.trim()}.` : ''

  return Array.from({ length: Math.max(1, Math.min(input.numPosts, 14)) }, (_, i) => {
    const angle = angles[i % angles.length]
    const business = input.businessName.trim() || 'our brand'

    return {
      id: `gen-${Date.now()}-${i}`,
      title: angle.title,
      caption: `${angle.caption.replace(/our brand|us/gi, business)}${toneNote}`,
      hashtags: `${angle.hashtags} #${platformTag}`,
      scheduledDate: dates[i],
      status: 'needs_review',
    }
  })
}

/**
 * Clones a template canvas and injects AI copy into text layers.
 */
export function generateCanvasFromTemplate(
  baseCanvas: CanvasData,
  aiTitle: string,
  aiCaption: string
): CanvasData {
  const cloned: CanvasData = JSON.parse(JSON.stringify(baseCanvas))

  const textLayers = cloned.layers
    .filter((l) => l.type === 'text')
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

  if (textLayers[0]) {
    ;(textLayers[0] as { content?: string }).content = aiTitle.toUpperCase()
  }
  if (textLayers[1]) {
    const snippet =
      aiCaption.length > 80 ? aiCaption.slice(0, 77) + '...' : aiCaption
    ;(textLayers[1] as { content?: string }).content = snippet
  }

  return cloned
}

/** Replace the background photo layer only — keeps layout, overlays, and text. */
export function setCanvasBackgroundImage(
  canvas: CanvasData,
  imageUrl: string
): CanvasData {
  const cloned: CanvasData = JSON.parse(JSON.stringify(canvas))
  const imageLayers = cloned.layers.filter((l) => l.type === 'image')
  if (!imageLayers.length) return cloned

  const preferred =
    imageLayers.find((l) => l.id === 'bg-image' || l.id === 'photo') ??
    [...imageLayers].sort((a, b) => {
      const areaA = (a.width || 0) * (a.height || 0)
      const areaB = (b.width || 0) * (b.height || 0)
      return areaB - areaA
    })[0]

  ;(preferred as { src?: string }).src = imageUrl
  return cloned
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'from', 'this', 'that',
  'your', 'our', 'you', 'we', 'are', 'is', 'was', 'were', 'been', 'here',
  'what', 'when', 'where', 'who', 'how', 'into', 'onto', 'about', 'just',
  'more', 'than', 'then', 'them', 'they', 'have', 'has', 'had', 'will',
  'can', 'could', 'should', 'would', 'make', 'made', 'get', 'got', 'also',
  'very', 'really', 'today', 'week', 'every', 'each', 'all', 'any', 'not',
  'out', 'new', 'now', 'link', 'bio', 'comment', 'share', 'like', 'follow',
])

const CATEGORY_AFFINITY: Record<string, string[]> = {
  Events: ['launch', 'event', 'announce', 'promotion', 'promo', 'party', 'conference'],
  Tech: ['tech', 'digital', 'innovation', 'software', 'app', 'saas', 'ai', 'startup'],
  Retail: ['sale', 'offer', 'discount', 'product', 'shop', 'retail', 'store', 'buy'],
  Fashion: ['fashion', 'style', 'brand', 'aesthetic', 'lookbook', 'outfit', 'wear'],
  Food: ['food', 'restaurant', 'drink', 'recipe', 'eat', 'cafe', 'kitchen', 'dining'],
  Fitness: ['fitness', 'gym', 'health', 'workout', 'wellness', 'training', 'run'],
  Interior: ['interior', 'design', 'home', 'decor', 'space', 'room', 'furniture'],
  Sports: ['sports', 'team', 'game', 'athlete', 'compete', 'match', 'league'],
}

const GOAL_VISUALS: Record<string, string[]> = {
  'increase brand awareness': ['brand', 'lifestyle', 'people', 'authentic'],
  'lead generation': ['professional', 'office', 'handshake', 'meeting'],
  'community engagement': ['community', 'people', 'gathering', 'smile'],
  'product launch': ['product', 'showcase', 'modern', 'launch'],
}

function tokenize(...parts: Array<string | null | undefined>): string[] {
  const out: string[] = []
  for (const part of parts) {
    if (!part?.trim()) continue
    for (const raw of part.toLowerCase().split(/[^a-z0-9]+/)) {
      if (raw.length < 3 || STOP_WORDS.has(raw)) continue
      out.push(raw)
    }
  }
  return out
}

export type TemplateMatchContext = {
  goal: string
  industry?: string
  services?: string
  caption?: string
  title?: string
  usageCounts?: Record<string, number>
}

/** Scores Studio templates from goal, industry, caption, name, and past usage. Free — no vision API. */
export function scoreTemplateMatch<
  T extends { id: string; category: string | null; name?: string | null },
>(tmpl: T, ctx: TemplateMatchContext): number {
  const corpus = tokenize(
    ctx.goal,
    ctx.industry,
    ctx.services,
    ctx.title,
    ctx.caption
  )
  const corpusSet = new Set(corpus)
  const goalLower = ctx.goal.toLowerCase()

  const categoryKeys = CATEGORY_AFFINITY[tmpl.category || ''] || []
  let score = 0

  for (const kw of categoryKeys) {
    if (goalLower.includes(kw) || corpusSet.has(kw)) score += 3
  }

  const nameTokens = tokenize(tmpl.name ?? '', tmpl.category ?? '')
  for (const token of nameTokens) {
    if (corpusSet.has(token)) score += 2
  }

  const usage = ctx.usageCounts?.[tmpl.id] ?? 0
  if (usage > 0) score += Math.min(usage, 5) * 2

  return score
}

export function matchTemplateToGoal<
  T extends { id: string; category: string | null; name?: string | null },
>(templates: T[], goalOrContext: string | TemplateMatchContext): T | null {
  if (!templates.length) return null

  const ctx: TemplateMatchContext =
    typeof goalOrContext === 'string' ? { goal: goalOrContext } : goalOrContext

  let best = templates[0]
  let bestScore = -1

  for (const tmpl of templates) {
    const score = scoreTemplateMatch(tmpl, ctx)
    if (score > bestScore) {
      bestScore = score
      best = tmpl
    }
  }

  return best
}

/** Score a Pexels photo alt/description against the same keyword corpus. */
export function scorePexelsAlt(
  alt: string | null | undefined,
  ctx: TemplateMatchContext
): number {
  const corpus = new Set(
    tokenize(ctx.goal, ctx.industry, ctx.services, ctx.title, ctx.caption)
  )
  const altTokens = tokenize(alt ?? '')
  let score = 1 // base for appearing in search results
  for (const token of altTokens) {
    if (corpus.has(token)) score += 2
  }
  return score
}

/**
 * Build a free Pexels search query from profile + post text (no LLM).
 * Keeps 3–6 concrete visual keywords.
 */
export function buildPexelsSearchQuery(ctx: {
  industry?: string
  services?: string
  location?: string
  goal?: string
  title?: string
  caption?: string
  businessName?: string
}): string {
  const tokens: string[] = []
  const pushUnique = (word: string | undefined | null) => {
    const w = word?.toLowerCase().trim()
    if (!w || w.length < 3 || STOP_WORDS.has(w)) return
    if (tokens.includes(w)) return
    tokens.push(w)
  }

  const industryWords = tokenize(ctx.industry).slice(0, 2)
  industryWords.forEach(pushUnique)

  const serviceWords = tokenize(ctx.services).slice(0, 2)
  serviceWords.forEach(pushUnique)

  const goalKey = (ctx.goal ?? '').toLowerCase().trim()
  const goalVisuals =
    GOAL_VISUALS[goalKey] ||
    Object.entries(GOAL_VISUALS).find(([k]) => goalKey.includes(k))?.[1] ||
    []
  goalVisuals.slice(0, 2).forEach(pushUnique)

  tokenize(ctx.title, ctx.caption)
    .slice(0, 4)
    .forEach(pushUnique)

  const locationWord = tokenize(ctx.location)[0]
  pushUnique(locationWord)

  if (tokens.length < 2) {
    pushUnique('business')
    pushUnique('marketing')
    pushUnique('lifestyle')
  }

  return tokens.slice(0, 6).join(' ')
}