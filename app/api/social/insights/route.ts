import { NextResponse } from 'next/server'
import { AuthError, requireAuth } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  getCachedInstagramInsights,
  syncInstagramInsights,
} from '@/lib/services/instagram-insights.service'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * GET — sync (best-effort) and return Instagram insights for Generate learning.
 * When Render has not shipped /api/v1/publish/insights yet, returns
 * status unavailable with a clear warning.
 */
export async function GET() {
  try {
    const session = await requireAuth()
    rateLimitOrThrow(`social:insights:${session.user.id}`, 20, 60_000)

    const { data: profile, error: profileError } = await getBusinessProfile(
      session.user.id
    )
    if (profileError) {
      return NextResponse.json({ error: profileError }, { status: 500 })
    }
    if (!profile) {
      return NextResponse.json(
        {
          error: 'Complete your business profile before loading insights.',
          insights: null,
          status: 'empty',
        },
        { status: 404 }
      )
    }

    const synced = await syncInstagramInsights({
      businessProfileId: profile.id,
      userId: session.user.id,
    })

    const insights =
      synced.insights ??
      (await getCachedInstagramInsights(profile.id, session.user.id))

    return NextResponse.json({
      insights,
      source: synced.source,
      status: insights?.status ?? 'unavailable',
      warning: synced.warning,
      businessProfileId: profile.id,
      contract: {
        expected:
          'GET /api/v1/publish/insights?business_profile_id={uuid}&platform=instagram',
      },
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Failed to load insights',
        insights: null,
      },
      { status: 500 }
    )
  }
}
