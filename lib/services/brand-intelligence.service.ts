import 'server-only'

import { openai } from '@/lib/openai'
import { resolveChatModel } from '@/lib/ai-models'
import { getUserAiPreferences } from '@/lib/services/ai-preferences.service'
import {
  formatBrandMemoryPromptBlock,
  getBrandMemoryContext,
} from '@/lib/services/brand-memory.service'
import {
  formatCompetitorInsightsPromptBlock,
  getCompetitorInsights,
} from '@/lib/services/competitor-intelligence.service'
import { getNichePresetForIndustry, isBarberSalonIndustry } from '@/lib/niche-presets'
import { fetchWebsiteSnapshot } from '@/lib/services/website-snapshot.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { BusinessProfile } from '@/types/business-profile'

export { fetchWebsiteSnapshot } from '@/lib/services/website-snapshot.service'

export type BrandIntelligenceStatus = 'pending' | 'ready' | 'stale' | 'error'

export type PostingWindow = {
  day?: string
  localTime?: string
  reason?: string
}

export type BrandIntelligence = {
  id: string
  businessProfileId: string
  userId: string
  summary: string | null
  contentPillars: string[]
  audienceInsights: string | null
  voiceGuidelines: string | null
  visualStyle: string | null
  hashtagSeeds: string[]
  ctaPatterns: string[]
  postingWindows: PostingWindow[]
  trendHooks: string[]
  igHandle: string | null
  igSnapshot: Record<string, unknown> | null
  websiteSnapshot: string | null
  researchNotes: string | null
  status: BrandIntelligenceStatus
  lastError: string | null
  enrichedAt: string | null
  updatedAt: string
}

type BrandIntelligenceRow = {
  id: string
  business_profile_id: string
  user_id: string
  summary: string | null
  content_pillars: unknown
  audience_insights: string | null
  voice_guidelines: string | null
  visual_style: string | null
  hashtag_seeds: unknown
  cta_patterns: unknown
  posting_windows: unknown
  trend_hooks: unknown
  ig_handle: string | null
  ig_snapshot: unknown
  website_snapshot: string | null
  research_notes: string | null
  status: BrandIntelligenceStatus
  last_error: string | null
  enriched_at: string | null
  updated_at: string
}

type SynthesisResult = {
  summary: string
  content_pillars: string[]
  audience_insights: string
  voice_guidelines: string
  visual_style: string
  hashtag_seeds: string[]
  cta_patterns: string[]
  posting_windows: PostingWindow[]
  trend_hooks: string[]
  research_notes: string
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)
    .slice(0, 20)
}

function asPostingWindows(value: unknown): PostingWindow[] {
  if (!Array.isArray(value)) return []
  const windows: PostingWindow[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const day = typeof row.day === 'string' ? row.day : undefined
    const localTime =
      typeof row.localTime === 'string'
        ? row.localTime
        : typeof row.local_time === 'string'
          ? row.local_time
          : undefined
    const reason = typeof row.reason === 'string' ? row.reason : undefined
    if (!day && !localTime) continue
    windows.push({ day, localTime, reason })
    if (windows.length >= 8) break
  }
  return windows
}

function rowToIntelligence(row: BrandIntelligenceRow): BrandIntelligence {
  return {
    id: row.id,
    businessProfileId: row.business_profile_id,
    userId: row.user_id,
    summary: row.summary,
    contentPillars: asStringArray(row.content_pillars),
    audienceInsights: row.audience_insights,
    voiceGuidelines: row.voice_guidelines,
    visualStyle: row.visual_style,
    hashtagSeeds: asStringArray(row.hashtag_seeds),
    ctaPatterns: asStringArray(row.cta_patterns),
    postingWindows: asPostingWindows(row.posting_windows),
    trendHooks: asStringArray(row.trend_hooks),
    igHandle: row.ig_handle,
    igSnapshot:
      row.ig_snapshot && typeof row.ig_snapshot === 'object'
        ? (row.ig_snapshot as Record<string, unknown>)
        : null,
    websiteSnapshot: row.website_snapshot,
    researchNotes: row.research_notes,
    status: row.status,
    lastError: row.last_error,
    enrichedAt: row.enriched_at,
    updatedAt: row.updated_at,
  }
}

/** Niche defaults until Instagram insights are available from MarketMe AI. */
export function defaultPostingWindows(industry?: string | null): PostingWindow[] {
  const niche = getNichePresetForIndustry(industry)
  if (niche) {
    return niche.postingWindows.map((w) => ({
      day: w.day,
      localTime: w.localTime,
      reason: w.reason,
    }))
  }
  const key = (industry || '').toLowerCase()
  if (/food|restaurant|cafe|bakery|bar/.test(key)) {
    return [
      { day: 'Tue–Thu', localTime: '11:00', reason: 'Lunch discovery window' },
      { day: 'Fri–Sat', localTime: '17:30', reason: 'Dinner / weekend plans' },
    ]
  }
  if (/beauty|spa|fitness|gym|wellness/.test(key)) {
    return [
      { day: 'Tue–Thu', localTime: '12:00', reason: 'Midday scroll break' },
      { day: 'Sun', localTime: '18:00', reason: 'Week planning / self-care' },
    ]
  }
  if (/retail|fashion|boutique|shop/.test(key)) {
    return [
      { day: 'Wed–Fri', localTime: '12:00', reason: 'Browse session' },
      { day: 'Sat', localTime: '10:00', reason: 'Weekend shopping mindset' },
    ]
  }
  return [
    { day: 'Tue–Thu', localTime: '11:00', reason: 'Weekday engagement peak' },
    { day: 'Wed', localTime: '19:00', reason: 'Evening scroll' },
  ]
}

export async function getBrandIntelligence(
  businessProfileId: string,
  userId: string
): Promise<BrandIntelligence | null> {
  const { data, error } = await supabaseAdmin
    .from('brand_intelligence')
    .select('*')
    .eq('business_profile_id', businessProfileId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[brand-intelligence] load failed', {
      businessProfileId,
      message: error.message,
    })
    return null
  }
  if (!data) return null
  return rowToIntelligence(data as BrandIntelligenceRow)
}

/**
 * Formats stored brand intelligence for strategy / caption / schedule prompts.
 */
export function formatBrandIntelligencePromptBlock(
  intel: BrandIntelligence | null | undefined
): string {
  if (!intel || intel.status === 'pending' || intel.status === 'error') return ''

  const parts: string[] = []
  if (intel.summary?.trim()) {
    parts.push(`Brand brain summary:\n${intel.summary.trim()}`)
  }
  if (intel.contentPillars.length > 0) {
    parts.push(`Content pillars:\n${intel.contentPillars.map((p) => `- ${p}`).join('\n')}`)
  }
  if (intel.audienceInsights?.trim()) {
    parts.push(`Audience:\n${intel.audienceInsights.trim()}`)
  }
  if (intel.voiceGuidelines?.trim()) {
    parts.push(`Voice:\n${intel.voiceGuidelines.trim()}`)
  }
  if (intel.visualStyle?.trim()) {
    parts.push(`Visual style:\n${intel.visualStyle.trim()}`)
  }
  if (intel.hashtagSeeds.length > 0) {
    parts.push(
      `Preferred hashtag seeds (mix niche + mid + branded; do not spam):\n${intel.hashtagSeeds.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`
    )
  }
  if (intel.ctaPatterns.length > 0) {
    parts.push(`CTA patterns that fit this brand:\n${intel.ctaPatterns.map((c) => `- ${c}`).join('\n')}`)
  }
  if (intel.postingWindows.length > 0) {
    const lines = intel.postingWindows.map((w) => {
      const when = [w.day, w.localTime].filter(Boolean).join(' @ ')
      return `- ${when}${w.reason ? ` (${w.reason})` : ''}`
    })
    parts.push(`Preferred posting windows (local business time):\n${lines.join('\n')}`)
  }
  if (intel.trendHooks.length > 0) {
    parts.push(
      `Current niche hooks / trends to weave in when natural:\n${intel.trendHooks.map((t) => `- ${t}`).join('\n')}`
    )
  }
  if (intel.igHandle?.trim()) {
    parts.push(`Instagram handle: @${intel.igHandle.replace(/^@/, '')}`)
  }

  if (parts.length === 0) return ''
  return `\n\nBrand brain (optimize for Instagram traction; stay on-brand):\n${parts.join('\n\n')}`
}

/**
 * Combined brand brain + revise/approve memory for pipeline injection.
 */
export async function buildBrandBrainPromptBlock(
  userId: string,
  businessProfileId?: string | null,
  options?: { maxMemoryExamples?: number }
): Promise<string> {
  const memory = await getBrandMemoryContext(userId, businessProfileId)
  const memoryBlock = formatBrandMemoryPromptBlock(memory, {
    maxExamples: options?.maxMemoryExamples,
  })

  let intelBlock = ''
  let competitorBlock = ''
  const profileId = businessProfileId || memory.businessProfileId
  if (profileId) {
    const [intel, competitorInsights] = await Promise.all([
      getBrandIntelligence(profileId, userId),
      getCompetitorInsights(profileId, userId),
    ])
    intelBlock = formatBrandIntelligencePromptBlock(intel)
    competitorBlock = formatCompetitorInsightsPromptBlock(competitorInsights)
  }

  return `${intelBlock}${competitorBlock}${memoryBlock}`.trim()
}

async function loadProfile(
  businessProfileId: string,
  userId: string
): Promise<BusinessProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data as BusinessProfile
}

async function loadInstagramHandle(
  businessProfileId: string,
  userId: string
): Promise<{ handle: string | null; snapshot: Record<string, unknown> | null }> {
  const { data } = await supabaseAdmin
    .from('business_social_connections')
    .select('handle, display_name, external_account_id, status, source, connected_at')
    .eq('business_profile_id', businessProfileId)
    .eq('user_id', userId)
    .eq('platform', 'instagram')
    .eq('status', 'connected')
    .maybeSingle()

  if (!data) {
    return { handle: null, snapshot: null }
  }

  const handle = (data.handle as string | null)?.replace(/^@/, '') || null
  return {
    handle,
    snapshot: {
      handle,
      display_name: data.display_name,
      external_account_id: data.external_account_id,
      source: data.source,
      connected_at: data.connected_at,
      note: 'Graph media/insights not yet synced from MarketMe AI publish API',
    },
  }
}

async function synthesizeBrandBrain(input: {
  profile: BusinessProfile
  igHandle: string | null
  igSnapshot: Record<string, unknown> | null
  websiteSnapshot: string | null
  userId: string
}): Promise<SynthesisResult> {
  const { profile, igHandle, websiteSnapshot } = input
  const prefs = await getUserAiPreferences(input.userId)
  const model = resolveChatModel(prefs.captionModel)

  const niche = getNichePresetForIndustry(profile.industry)
  const fallback: SynthesisResult = {
    summary: [
      profile.business_name || 'This business',
      profile.industry ? `in ${profile.industry}` : null,
      profile.usp ? `known for ${profile.usp}` : null,
      profile.primary_goal ? `Goal: ${profile.primary_goal}` : null,
      isBarberSalonIndustry(profile.industry)
        ? 'Priority niche: barbers & salons — visual, booking-led Instagram content'
        : null,
    ]
      .filter(Boolean)
      .join('. '),
    content_pillars: niche?.contentPillars.slice(0, 5) ??
      ['Educate', 'Social proof', 'Offer / CTA', 'Behind the brand'].slice(
        0,
        profile.primary_goal?.toLowerCase().includes('lead') ? 4 : 3
      ),
    audience_insights:
      profile.target_customers ||
      niche?.targetCustomers ||
      'Local customers who value quality and trust.',
    voice_guidelines: profile.tone || niche?.tone || 'Friendly, clear, and professional.',
    visual_style: isBarberSalonIndustry(profile.industry)
      ? 'Sharp before/after shots, clean fades/cuts close-ups, warm shop atmosphere, readable booking CTAs.'
      : 'Clean product/service photography, readable text overlays, brand-consistent colors.',
    hashtag_seeds: niche?.hashtagSeeds.slice(0, 10) ??
      [
        profile.industry?.replace(/\s+/g, '') || 'smallbusiness',
        profile.location?.split(',')[0]?.replace(/\s+/g, '') || 'local',
        (profile.business_name || 'brand').replace(/\s+/g, ''),
      ].filter(Boolean),
    cta_patterns: isBarberSalonIndustry(profile.industry)
      ? ['Book now', 'DM to reserve', 'Walk-ins welcome', 'Link in bio to book']
      : ['Book now', 'DM us', 'Link in bio', 'Visit us this week'].slice(0, 3),
    posting_windows: defaultPostingWindows(profile.industry),
    trend_hooks: niche?.trendHooks.slice(0, 4) ?? [
      'Short educational Reels',
      'Before/after or transformation',
      'Customer story / UGC-style',
    ],
    research_notes: 'Heuristic fallback (OpenAI synthesis unavailable or failed).',
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return fallback
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are MarketMe's brand strategist. Build a compact "brand brain" for Instagram growth.
${isBarberSalonIndustry(profile.industry) ? 'This business is in the barber/salon niche — prioritize booking CTAs, before/after, tips, and testimonials.' : ''}
Return JSON only with keys:
summary (string),
content_pillars (string[3-5]),
audience_insights (string),
voice_guidelines (string),
visual_style (string),
hashtag_seeds (string[6-12] without #),
cta_patterns (string[2-5]),
posting_windows (array of {day, localTime, reason}),
trend_hooks (string[3-6] niche Instagram trends/hooks),
research_notes (string, short).
Focus on traction: hooks, clarity, niche hashtags, realistic local posting times.
Do not invent false awards or fake stats.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            business_name: profile.business_name,
            industry: profile.industry,
            location: profile.location,
            website: profile.website,
            services: profile.services,
            usp: profile.usp,
            primary_goal: profile.primary_goal,
            tone: profile.tone,
            target_customers: profile.target_customers,
            competitors: profile.competitors,
            channels: profile.channels,
            instagram_handle: igHandle,
            website_excerpt: websiteSnapshot,
          }),
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw) as Partial<SynthesisResult>
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 1200) : fallback.summary,
      content_pillars:
        asStringArray(parsed.content_pillars).length > 0
          ? asStringArray(parsed.content_pillars).slice(0, 5)
          : fallback.content_pillars,
      audience_insights:
        typeof parsed.audience_insights === 'string'
          ? parsed.audience_insights.slice(0, 800)
          : fallback.audience_insights,
      voice_guidelines:
        typeof parsed.voice_guidelines === 'string'
          ? parsed.voice_guidelines.slice(0, 800)
          : fallback.voice_guidelines,
      visual_style:
        typeof parsed.visual_style === 'string'
          ? parsed.visual_style.slice(0, 800)
          : fallback.visual_style,
      hashtag_seeds: (() => {
        const seeds = asStringArray(parsed.hashtag_seeds)
          .map((h) => h.replace(/^#/, ''))
          .slice(0, 12)
        return seeds.length > 0 ? seeds : fallback.hashtag_seeds
      })(),
      cta_patterns: (() => {
        const ctas = asStringArray(parsed.cta_patterns).slice(0, 5)
        return ctas.length > 0 ? ctas : fallback.cta_patterns
      })(),
      posting_windows:
        asPostingWindows(parsed.posting_windows).length > 0
          ? asPostingWindows(parsed.posting_windows)
          : fallback.posting_windows,
      trend_hooks: (() => {
        const hooks = asStringArray(parsed.trend_hooks).slice(0, 6)
        return hooks.length > 0 ? hooks : fallback.trend_hooks
      })(),
      research_notes:
        typeof parsed.research_notes === 'string'
          ? parsed.research_notes.slice(0, 600)
          : 'Synthesized from profile + website + Instagram handle.',
    }
  } catch (error) {
    console.error('[brand-intelligence] synthesis failed', {
      message: error instanceof Error ? error.message : 'unknown',
    })
    return fallback
  }
}

/**
 * Collect profile + Instagram connection + website signals, synthesize brand brain, upsert.
 */
export async function enrichBrandIntelligence(input: {
  businessProfileId: string
  userId: string
}): Promise<BrandIntelligence | null> {
  const profile = await loadProfile(input.businessProfileId, input.userId)
  if (!profile) {
    console.error('[brand-intelligence] profile missing', input)
    return null
  }

  const now = new Date().toISOString()
  await supabaseAdmin.from('brand_intelligence').upsert(
    {
      business_profile_id: input.businessProfileId,
      user_id: input.userId,
      status: 'pending',
      last_error: null,
      updated_at: now,
    },
    { onConflict: 'business_profile_id' }
  )

  try {
    const [{ handle, snapshot }, websiteSnapshot] = await Promise.all([
      loadInstagramHandle(input.businessProfileId, input.userId),
      fetchWebsiteSnapshot(profile.website),
    ])

    const igHandle = handle || profile.social_handle?.replace(/^@/, '') || null
    const synthesis = await synthesizeBrandBrain({
      profile,
      igHandle,
      igSnapshot: snapshot,
      websiteSnapshot,
      userId: input.userId,
    })

    const { data, error } = await supabaseAdmin
      .from('brand_intelligence')
      .upsert(
        {
          business_profile_id: input.businessProfileId,
          user_id: input.userId,
          summary: synthesis.summary,
          content_pillars: synthesis.content_pillars,
          audience_insights: synthesis.audience_insights,
          voice_guidelines: synthesis.voice_guidelines,
          visual_style: synthesis.visual_style,
          hashtag_seeds: synthesis.hashtag_seeds,
          cta_patterns: synthesis.cta_patterns,
          posting_windows: synthesis.posting_windows,
          trend_hooks: synthesis.trend_hooks,
          ig_handle: igHandle,
          ig_snapshot: snapshot,
          website_snapshot: websiteSnapshot,
          research_notes: synthesis.research_notes,
          status: 'ready',
          last_error: null,
          enriched_at: now,
          updated_at: now,
        },
        { onConflict: 'business_profile_id' }
      )
      .select('*')
      .single()

    if (error || !data) {
      console.error('[brand-intelligence] upsert failed', { message: error?.message })
      return null
    }

    return rowToIntelligence(data as BrandIntelligenceRow)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Enrichment failed'
    await supabaseAdmin
      .from('brand_intelligence')
      .upsert(
        {
          business_profile_id: input.businessProfileId,
          user_id: input.userId,
          status: 'error',
          last_error: message.slice(0, 500),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_profile_id' }
      )
    console.error('[brand-intelligence] enrich failed', { ...input, message })
    return null
  }
}

/** Fire-and-forget enrich; never throws to callers. Prefers Trigger when configured. */
export function scheduleBrandIntelligenceRefresh(input: {
  businessProfileId: string
  userId: string
}): void {
  void (async () => {
    try {
      if (process.env.TRIGGER_SECRET_KEY?.trim()) {
        const { triggerBrandIntelligenceRefresh } = await import(
          '@/lib/services/scheduler.service'
        )
        await triggerBrandIntelligenceRefresh(input.businessProfileId, input.userId)
        return
      }
    } catch (error) {
      console.error('[brand-intelligence] trigger enqueue failed; running inline', {
        message: error instanceof Error ? error.message : 'unknown',
      })
    }
    await enrichBrandIntelligence(input)
  })().catch((error) => {
    console.error('[brand-intelligence] background refresh failed', {
      ...input,
      message: error instanceof Error ? error.message : 'unknown',
    })
  })
}
