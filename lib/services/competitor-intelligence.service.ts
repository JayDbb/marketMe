import 'server-only'

import { openai } from '@/lib/openai'
import { resolveChatModel } from '@/lib/ai-models'
import { getUserAiPreferences } from '@/lib/services/ai-preferences.service'
import { fetchWebsiteSnapshot } from '@/lib/services/website-snapshot.service'
import { getNichePresetForIndustry, isBarberSalonIndustry } from '@/lib/niche-presets'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { BusinessProfile } from '@/types/business-profile'

export type CompetitorSource = 'onboarding' | 'settings' | 'manual'

export type CompetitorEntry = {
  label: string
  instagramHandle?: string | null
  websiteUrl?: string | null
  source?: CompetitorSource
}

export type BusinessCompetitor = {
  id: string
  businessProfileId: string
  userId: string
  label: string
  instagramHandle: string | null
  websiteUrl: string | null
  source: CompetitorSource
}

export type CompetitorInsightsStatus = 'pending' | 'ready' | 'error'

export type CompetitorInsights = {
  id: string
  businessProfileId: string
  userId: string
  summary: string | null
  postingPatterns: string[]
  contentTypes: string[]
  promotionalPatterns: string[]
  opportunities: string[]
  rawNotes: string | null
  status: CompetitorInsightsStatus
  lastError: string | null
  analyzedAt: string | null
}

type CompetitorRow = {
  id: string
  business_profile_id: string
  user_id: string
  label: string
  instagram_handle: string | null
  website_url: string | null
  source: CompetitorSource
}

type InsightsRow = {
  id: string
  business_profile_id: string
  user_id: string
  summary: string | null
  posting_patterns: unknown
  content_types: unknown
  promotional_patterns: unknown
  opportunities: unknown
  raw_notes: string | null
  status: CompetitorInsightsStatus
  last_error: string | null
  analyzed_at: string | null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)
    .slice(0, 12)
}

function rowToCompetitor(row: CompetitorRow): BusinessCompetitor {
  return {
    id: row.id,
    businessProfileId: row.business_profile_id,
    userId: row.user_id,
    label: row.label,
    instagramHandle: row.instagram_handle,
    websiteUrl: row.website_url,
    source: row.source,
  }
}

function rowToInsights(row: InsightsRow): CompetitorInsights {
  return {
    id: row.id,
    businessProfileId: row.business_profile_id,
    userId: row.user_id,
    summary: row.summary,
    postingPatterns: asStringArray(row.posting_patterns),
    contentTypes: asStringArray(row.content_types),
    promotionalPatterns: asStringArray(row.promotional_patterns),
    opportunities: asStringArray(row.opportunities),
    rawNotes: row.raw_notes,
    status: row.status,
    lastError: row.last_error,
    analyzedAt: row.analyzed_at,
  }
}

function normalizeHandle(handle?: string | null): string | null {
  if (!handle?.trim()) return null
  return handle.trim().replace(/^@/, '').split(/[/?#]/)[0] || null
}

function normalizeWebsite(url?: string | null): string | null {
  const raw = url?.trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.includes('.')) return `https://${raw}`
  return null
}

export async function listCompetitors(
  businessProfileId: string,
  userId: string
): Promise<BusinessCompetitor[]> {
  const { data, error } = await supabaseAdmin
    .from('business_competitors')
    .select('*')
    .eq('business_profile_id', businessProfileId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[competitor-intelligence] list failed', { message: error.message })
    return []
  }
  return (data as CompetitorRow[] | null)?.map(rowToCompetitor) ?? []
}

export async function getCompetitorInsights(
  businessProfileId: string,
  userId: string
): Promise<CompetitorInsights | null> {
  const { data, error } = await supabaseAdmin
    .from('competitor_insights')
    .select('*')
    .eq('business_profile_id', businessProfileId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[competitor-intelligence] insights load failed', {
      message: error.message,
    })
    return null
  }
  if (!data) return null
  return rowToInsights(data as InsightsRow)
}

/**
 * Replace competitor set for a profile and sync a short summary onto business_profiles.competitors.
 */
export async function replaceCompetitors(input: {
  businessProfileId: string
  userId: string
  entries: CompetitorEntry[]
  source?: CompetitorSource
}): Promise<BusinessCompetitor[]> {
  const source = input.source ?? 'manual'
  const cleaned = input.entries
    .map((e) => ({
      label: e.label.trim() || e.instagramHandle || e.websiteUrl || 'Competitor',
      instagramHandle: normalizeHandle(e.instagramHandle),
      websiteUrl: normalizeWebsite(e.websiteUrl),
      source: e.source ?? source,
    }))
    .filter((e) => e.instagramHandle || e.websiteUrl)
    .slice(0, 5)

  await supabaseAdmin
    .from('business_competitors')
    .delete()
    .eq('business_profile_id', input.businessProfileId)
    .eq('user_id', input.userId)

  if (cleaned.length === 0) {
    await supabaseAdmin
      .from('business_profiles')
      .update({ competitors: null, updated_at: new Date().toISOString() })
      .eq('id', input.businessProfileId)
      .eq('user_id', input.userId)
    return []
  }

  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('business_competitors')
    .insert(
      cleaned.map((e) => ({
        business_profile_id: input.businessProfileId,
        user_id: input.userId,
        label: e.label.slice(0, 120),
        instagram_handle: e.instagramHandle,
        website_url: e.websiteUrl,
        source: e.source,
        updated_at: now,
      }))
    )
    .select('*')

  if (error) {
    console.error('[competitor-intelligence] replace failed', { message: error.message })
    throw new Error(error.message)
  }

  const summary = cleaned
    .map((e) => e.instagramHandle ? `@${e.instagramHandle}` : e.websiteUrl)
    .filter(Boolean)
    .join(', ')

  await supabaseAdmin
    .from('business_profiles')
    .update({ competitors: summary.slice(0, 500), updated_at: now })
    .eq('id', input.businessProfileId)
    .eq('user_id', input.userId)

  return (data as CompetitorRow[] | null)?.map(rowToCompetitor) ?? []
}

export function formatCompetitorInsightsPromptBlock(
  insights: CompetitorInsights | null | undefined
): string {
  if (!insights || insights.status !== 'ready') return ''

  const parts: string[] = []
  if (insights.summary?.trim()) {
    parts.push(`Competitor landscape:\n${insights.summary.trim()}`)
  }
  if (insights.postingPatterns.length > 0) {
    parts.push(
      `Competitor posting patterns (inferred):\n${insights.postingPatterns.map((p) => `- ${p}`).join('\n')}`
    )
  }
  if (insights.contentTypes.length > 0) {
    parts.push(
      `Common competitor content types:\n${insights.contentTypes.map((p) => `- ${p}`).join('\n')}`
    )
  }
  if (insights.promotionalPatterns.length > 0) {
    parts.push(
      `Promotional patterns:\n${insights.promotionalPatterns.map((p) => `- ${p}`).join('\n')}`
    )
  }
  if (insights.opportunities.length > 0) {
    parts.push(
      `Content opportunities (differentiate; do not copy competitors):\n${insights.opportunities.map((p) => `- ${p}`).join('\n')}`
    )
  }

  if (parts.length === 0) return ''
  return `\n\nCompetitor intelligence (inferred from declared competitors — not live IG metrics):\n${parts.join('\n\n')}`
}

type AnalysisJson = {
  summary?: string
  posting_patterns?: string[]
  content_types?: string[]
  promotional_patterns?: string[]
  opportunities?: string[]
  raw_notes?: string
}

function salonAwareFallback(profile: BusinessProfile, competitors: BusinessCompetitor[]): AnalysisJson {
  const names = competitors.map((c) => c.label).join(', ') || 'local competitors'
  const salon = isBarberSalonIndustry(profile.industry)
  return {
    summary: `Competitors in focus: ${names}. Differentiate with clearer offers, local trust, and consistent booking CTAs.`,
    posting_patterns: salon
      ? ['Often ~3 Reels/week in this niche', 'Weekend promo pushes are common']
      : ['Mixed weekly cadence', 'Promo posts clustered around weekends'],
    content_types: salon
      ? ['Before/after transformations', 'Testimonials', 'Service promos']
      : ['Product/service highlights', 'Social proof', 'Offers'],
    promotional_patterns: salon
      ? ['Walk-in / book-this-week CTAs', 'Bundle or fade specials']
      : ['Discount codes', 'Limited-time offers'],
    opportunities: salon
      ? [
          'Educational grooming tips competitors underuse',
          'Customer transformation storytelling',
          'Clear booking reminders mid-week',
        ]
      : [
          'Educational content gap',
          'Stronger customer stories',
          'Clearer mid-week CTAs',
        ],
    raw_notes: 'Heuristic fallback (OpenAI unavailable or failed).',
  }
}

export async function analyzeCompetitors(input: {
  businessProfileId: string
  userId: string
}): Promise<CompetitorInsights | null> {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('business_profiles')
    .select('*')
    .eq('id', input.businessProfileId)
    .eq('user_id', input.userId)
    .maybeSingle()

  if (profileError || !profile) {
    console.error('[competitor-intelligence] profile missing', input)
    return null
  }

  const typed = profile as BusinessProfile
  const competitors = await listCompetitors(input.businessProfileId, input.userId)
  const now = new Date().toISOString()

  await supabaseAdmin.from('competitor_insights').upsert(
    {
      business_profile_id: input.businessProfileId,
      user_id: input.userId,
      status: 'pending',
      last_error: null,
      updated_at: now,
    },
    { onConflict: 'business_profile_id' }
  )

  if (competitors.length === 0) {
    const empty = salonAwareFallback(typed, [])
    empty.summary = 'No competitors declared yet. Add Instagram handles or websites in Settings.'
    empty.opportunities = getNichePresetForIndustry(typed.industry)?.trendHooks.slice(0, 3) ??
      empty.opportunities

    const { data } = await supabaseAdmin
      .from('competitor_insights')
      .upsert(
        {
          business_profile_id: input.businessProfileId,
          user_id: input.userId,
          summary: empty.summary,
          posting_patterns: empty.posting_patterns,
          content_types: empty.content_types,
          promotional_patterns: empty.promotional_patterns,
          opportunities: empty.opportunities,
          raw_notes: empty.raw_notes,
          status: 'ready',
          last_error: null,
          analyzed_at: now,
          updated_at: now,
        },
        { onConflict: 'business_profile_id' }
      )
      .select('*')
      .single()

    return data ? rowToInsights(data as InsightsRow) : null
  }

  try {
    const websiteSnippets = await Promise.all(
      competitors.map(async (c) => ({
        label: c.label,
        handle: c.instagramHandle,
        website: c.websiteUrl,
        excerpt: c.websiteUrl ? await fetchWebsiteSnapshot(c.websiteUrl) : null,
      }))
    )

    let parsed: AnalysisJson = salonAwareFallback(typed, competitors)

    if (process.env.OPENAI_API_KEY?.trim()) {
      const prefs = await getUserAiPreferences(input.userId)
      const model = resolveChatModel(prefs.captionModel)
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are MarketMe's competitive strategist for small businesses (barbers/salons are a priority niche).
Return JSON only with keys:
summary (string),
posting_patterns (string[]),
content_types (string[]),
promotional_patterns (string[]),
opportunities (string[] — concrete content gaps our client can own),
raw_notes (string).
Base claims on provided competitor names, handles, and website excerpts only.
Do NOT invent live follower counts or claim you scraped Instagram.
Label patterns as inferred niche norms when data is thin.
Never tell the client to copy a competitor by name in captions.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              business: {
                name: typed.business_name,
                industry: typed.industry,
                location: typed.location,
                services: typed.services,
                usp: typed.usp,
                goal: typed.primary_goal,
              },
              competitors: websiteSnippets,
            }),
          },
        ],
      })

      const raw = completion.choices[0]?.message?.content || '{}'
      const json = JSON.parse(raw) as AnalysisJson
      parsed = {
        summary:
          typeof json.summary === 'string' ? json.summary.slice(0, 1200) : parsed.summary,
        posting_patterns:
          asStringArray(json.posting_patterns).length > 0
            ? asStringArray(json.posting_patterns)
            : parsed.posting_patterns,
        content_types:
          asStringArray(json.content_types).length > 0
            ? asStringArray(json.content_types)
            : parsed.content_types,
        promotional_patterns:
          asStringArray(json.promotional_patterns).length > 0
            ? asStringArray(json.promotional_patterns)
            : parsed.promotional_patterns,
        opportunities:
          asStringArray(json.opportunities).length > 0
            ? asStringArray(json.opportunities)
            : parsed.opportunities,
        raw_notes:
          typeof json.raw_notes === 'string'
            ? json.raw_notes.slice(0, 600)
            : 'Synthesized from declared competitors + website excerpts.',
      }
    }

    const { data, error } = await supabaseAdmin
      .from('competitor_insights')
      .upsert(
        {
          business_profile_id: input.businessProfileId,
          user_id: input.userId,
          summary: parsed.summary ?? null,
          posting_patterns: parsed.posting_patterns ?? [],
          content_types: parsed.content_types ?? [],
          promotional_patterns: parsed.promotional_patterns ?? [],
          opportunities: parsed.opportunities ?? [],
          raw_notes: parsed.raw_notes ?? null,
          status: 'ready',
          last_error: null,
          analyzed_at: now,
          updated_at: now,
        },
        { onConflict: 'business_profile_id' }
      )
      .select('*')
      .single()

    if (error || !data) {
      console.error('[competitor-intelligence] upsert insights failed', {
        message: error?.message,
      })
      return null
    }

    // Nudge brand brain to refresh with new opportunities.
    await supabaseAdmin
      .from('brand_intelligence')
      .update({ status: 'stale', updated_at: now })
      .eq('business_profile_id', input.businessProfileId)
      .eq('user_id', input.userId)

    return rowToInsights(data as InsightsRow)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed'
    await supabaseAdmin.from('competitor_insights').upsert(
      {
        business_profile_id: input.businessProfileId,
        user_id: input.userId,
        status: 'error',
        last_error: message.slice(0, 500),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_profile_id' }
    )
    console.error('[competitor-intelligence] analyze failed', { ...input, message })
    return null
  }
}

/** Fire-and-forget competitor analysis; never throws. */
export function scheduleCompetitorAnalysis(input: {
  businessProfileId: string
  userId: string
}): void {
  void (async () => {
    try {
      if (process.env.TRIGGER_SECRET_KEY?.trim()) {
        const { triggerCompetitorAnalysis } = await import(
          '@/lib/services/scheduler.service'
        )
        await triggerCompetitorAnalysis(input.businessProfileId, input.userId)
        return
      }
    } catch (error) {
      console.error('[competitor-intelligence] trigger enqueue failed; running inline', {
        message: error instanceof Error ? error.message : 'unknown',
      })
    }
    await analyzeCompetitors(input)
  })().catch((error) => {
    console.error('[competitor-intelligence] background analyze failed', {
      ...input,
      message: error instanceof Error ? error.message : 'unknown',
    })
  })
}
