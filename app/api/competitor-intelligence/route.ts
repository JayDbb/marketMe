import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  analyzeCompetitors,
  getCompetitorInsights,
  listCompetitors,
  replaceCompetitors,
  type CompetitorEntry,
} from '@/lib/services/competitor-intelligence.service'
import { scheduleBrandIntelligenceRefresh } from '@/lib/services/brand-intelligence.service'
import { parseCompetitorLines } from '@/lib/niche-presets'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/** Authenticated: list competitors + latest insights. */
export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
  }

  const { data: profile, error } = await getBusinessProfile(session.user.id)
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
  if (!profile) {
    return NextResponse.json(
      { error: 'Complete your business profile first.', competitors: [], insights: null },
      { status: 404 }
    )
  }

  const [competitors, insights] = await Promise.all([
    listCompetitors(profile.id, session.user.id),
    getCompetitorInsights(profile.id, session.user.id),
  ])

  return NextResponse.json({
    businessProfileId: profile.id,
    competitors,
    insights,
  })
}

/**
 * Authenticated:
 * - body.action === 'save' → replace competitors (optional analyze)
 * - default / action === 'analyze' → run competitor analysis
 */
export async function POST(request: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
  }

  try {
    rateLimitOrThrow(`competitor-intelligence:${session.user.id}`, 8, 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  const { data: profile, error } = await getBusinessProfile(session.user.id)
  if (error || !profile) {
    return NextResponse.json(
      { error: error || 'Business profile required' },
      { status: 404 }
    )
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: 'save' | 'analyze'
    competitorsText?: string
    entries?: CompetitorEntry[]
    analyzeAfterSave?: boolean
  }

  if (body.action === 'save') {
    let entries: CompetitorEntry[] = Array.isArray(body.entries) ? body.entries : []
    if (typeof body.competitorsText === 'string') {
      entries = parseCompetitorLines(body.competitorsText).map((e) => ({
        label: e.label,
        instagramHandle: e.instagramHandle,
        websiteUrl: e.websiteUrl,
        source: 'settings' as const,
      }))
    }

    try {
      const competitors = await replaceCompetitors({
        businessProfileId: profile.id,
        userId: session.user.id,
        entries,
        source: 'settings',
      })

      if (body.analyzeAfterSave !== false) {
        const insights = await analyzeCompetitors({
          businessProfileId: profile.id,
          userId: session.user.id,
        })
        scheduleBrandIntelligenceRefresh({
          businessProfileId: profile.id,
          userId: session.user.id,
        })
        return NextResponse.json({ success: true, competitors, insights })
      }

      return NextResponse.json({ success: true, competitors })
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : 'Could not save competitors. Apply migration 029_competitor_intelligence.sql.',
        },
        { status: 500 }
      )
    }
  }

  const insights = await analyzeCompetitors({
    businessProfileId: profile.id,
    userId: session.user.id,
  })

  if (!insights) {
    return NextResponse.json(
      {
        error:
          'Could not analyze competitors. Apply migration 029 and ensure OPENAI_API_KEY is set for richer results.',
      },
      { status: 500 }
    )
  }

  scheduleBrandIntelligenceRefresh({
    businessProfileId: profile.id,
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, insights })
}
