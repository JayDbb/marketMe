import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import { toAiBusinessId } from '@/lib/ai-business-id'
import {
  getSocialConnections,
  MarketingAIError,
  type RawSocialConnection,
} from '@/lib/services/marketing-ai.service'
import { mapRawConnection } from '@/lib/social/oauth'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function mapConnections(raw: RawSocialConnection[]) {
  return raw.map((acc) =>
    mapRawConnection({
      id: acc.id,
      platform: acc.platform,
      handle: acc.handle,
      account_url: acc.account_url,
      connected_status: acc.connected_status,
      instagram_user_id: acc.instagram_user_id,
      facebook_page_id: acc.facebook_page_id,
      created_at: acc.created_at,
    })
  )
}

/** Authenticated: list social connections for the signed-in user's business only. */
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

  try {
    rateLimitOrThrow(`social:connections:${session.user.id}`, 60, 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  const { data: profile, error: profileError } = await getBusinessProfile(session.user.id)
  if (profileError) {
    return NextResponse.json({ error: profileError }, { status: 500 })
  }
  if (!profile) {
    return NextResponse.json(
      {
        error: 'Complete your business profile before connecting social accounts.',
        connections: [],
      },
      { status: 404 }
    )
  }

  try {
    const raw = await getSocialConnections(toAiBusinessId(profile.id))
    return NextResponse.json({
      connections: mapConnections(Array.isArray(raw) ? raw : []),
      businessProfileId: profile.id,
      aiBusinessId: toAiBusinessId(profile.id),
    })
  } catch (error) {
    const message =
      error instanceof MarketingAIError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to load connections'
    console.error('[social/connections]', message)
    const friendly =
      /SecretStr/i.test(message)
        ? 'Meta authorized your account, but the publish API cannot save or load Instagram tokens (backend SecretStr bug). Unwrap secrets with .get_secret_value() before DB/HTTP use, then reconnect.'
        : message
    return NextResponse.json({ error: friendly }, { status: 502 })
  }
}
