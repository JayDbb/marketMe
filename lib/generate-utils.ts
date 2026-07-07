import { toDatetimeLocalValue } from '@/lib/calendar-utils'
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
  defaultTone: string
  defaultGoal: string
  defaultPlatform: string
  hasOpenAI: boolean
  templateCount: number
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
  const d = new Date(value)
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

/** Scores templates against the content goal using category keyword affinity. */
export function matchTemplateToGoal<
  T extends { id: string; category: string | null },
>(templates: T[], goal: string): T | null {
  if (!templates.length) return null

  const goalLower = goal.toLowerCase()

  const affinityMap: Record<string, string[]> = {
    Events: ['launch', 'event', 'announce', 'promotion', 'promo'],
    Tech: ['tech', 'digital', 'innovation', 'software', 'app', 'saas'],
    Retail: ['sale', 'offer', 'discount', 'product', 'shop', 'retail'],
    Fashion: ['fashion', 'style', 'brand', 'aesthetic', 'lookbook'],
    Food: ['food', 'restaurant', 'drink', 'recipe', 'eat'],
    Fitness: ['fitness', 'gym', 'health', 'workout', 'wellness'],
    Interior: ['interior', 'design', 'home', 'decor', 'space'],
    Sports: ['sports', 'team', 'game', 'athlete', 'compete'],
  }

  let best = templates[0]
  let bestScore = 0

  for (const tmpl of templates) {
    const keywords = affinityMap[tmpl.category || ''] || []
    const score = keywords.filter((kw) => goalLower.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      best = tmpl
    }
  }

  return best
}