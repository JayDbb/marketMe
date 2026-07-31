import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  enrichBrandIntelligence,
  getBrandIntelligence,
} from '@/lib/services/brand-intelligence.service'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/** Authenticated: read current brand brain for the user's business. */
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
      { error: 'Complete your business profile first.', intelligence: null },
      { status: 404 }
    )
  }

  const intelligence = await getBrandIntelligence(profile.id, session.user.id)
  return NextResponse.json({
    businessProfileId: profile.id,
    intelligence,
  })
}

/** Authenticated: rebuild brand brain from profile + Instagram + website. */
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
    rateLimitOrThrow(`brand-intelligence:${session.user.id}`, 6, 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  void request
  const { data: profile, error } = await getBusinessProfile(session.user.id)
  if (error || !profile) {
    return NextResponse.json(
      { error: error || 'Business profile required' },
      { status: 404 }
    )
  }

  const intelligence = await enrichBrandIntelligence({
    businessProfileId: profile.id,
    userId: session.user.id,
  })

  if (!intelligence) {
    return NextResponse.json(
      {
        error:
          'Could not build brand intelligence. Apply migration 028_brand_intelligence.sql and ensure OPENAI_API_KEY is set for richer results.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, intelligence })
}
