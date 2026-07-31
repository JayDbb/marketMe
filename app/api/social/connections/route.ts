import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  getSocialConnections,
  MarketingAIError,
  type RawSocialConnection,
} from '@/lib/services/marketing-ai.service'
import { mapRawConnection } from '@/lib/social/oauth'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'
import {
  listMirroredConnections,
  mergeRemoteAndMirrored,
  syncMirroredFromRemote,
  upsertMirroredConnection,
  markMirroredDisconnected,
} from '@/lib/services/social-connections.service'
import type { SocialPlatform } from '@/types/social'

export const runtime = 'nodejs'

function mapConnections(raw: RawSocialConnection[]) {
  return raw.map((acc) =>
    mapRawConnection({
      id: acc.account_id ?? acc.id,
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

/** Authenticated: list social connections (AI publish + local MarketMe mirror). */
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

  const mirrored = await listMirroredConnections(profile.id, session.user.id)

  try {
    const raw = await getSocialConnections(profile.id)
    const remote = mapConnections(Array.isArray(raw) ? raw : [])
    await syncMirroredFromRemote({
      businessProfileId: profile.id,
      userId: session.user.id,
      connections: remote,
    })
    const connections = mergeRemoteAndMirrored(remote, mirrored)
    return NextResponse.json({
      connections,
      businessProfileId: profile.id,
      source: remote.length > 0 ? 'marketme-ai' : mirrored.length > 0 ? 'mirror' : 'empty',
    })
  } catch (error) {
    const message =
      error instanceof MarketingAIError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to load connections'
    console.error('[social/connections]', message)

    // Still show locally mirrored OAuth success so MarketMe UI reflects Meta connect.
    if (mirrored.length > 0) {
      const friendly =
        /SecretStr/i.test(message)
          ? 'Instagram is saved in MarketMe, but the publish API cannot verify tokens yet (SecretStr). Tokens may still be on Meta — reconnect after the AI API fix.'
          : `Instagram is saved in MarketMe. Publish service list failed: ${message.replace(/^MarketMe-AI error:\s*/i, '')}`
      return NextResponse.json({
        connections: mirrored,
        businessProfileId: profile.id,
        source: 'mirror',
        warning: friendly,
      })
    }

    const friendly =
      /SecretStr/i.test(message)
        ? 'Meta authorized your account, but the publish API cannot save or load Instagram tokens (backend SecretStr bug). Unwrap secrets with .get_secret_value() before DB/HTTP use, then reconnect.'
        : message
    return NextResponse.json({ error: friendly, connections: [] }, { status: 502 })
  }
}

/**
 * Confirm OAuth success in MarketMe (local mirror).
 * Called when FRONTEND_URL returns with oauth=instagram&status=success.
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
    rateLimitOrThrow(`social:connections-confirm:${session.user.id}`, 20, 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  const body = (await request.json().catch(() => ({}))) as {
    platform?: string
    handle?: string
    action?: 'confirm' | 'disconnect'
    connectionId?: string
  }

  const platform = (body.platform || 'instagram') as SocialPlatform
  if (platform !== 'instagram') {
    return NextResponse.json({ error: 'Only Instagram is supported' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await getBusinessProfile(session.user.id)
  if (profileError || !profile) {
    return NextResponse.json(
      { error: profileError || 'Business profile required' },
      { status: 404 }
    )
  }

  if (body.action === 'disconnect') {
    await markMirroredDisconnected({
      businessProfileId: profile.id,
      userId: session.user.id,
      platform,
      connectionId: body.connectionId,
    })
    return NextResponse.json({ success: true, connections: [] })
  }

  const connection = await upsertMirroredConnection({
    businessProfileId: profile.id,
    userId: session.user.id,
    platform: 'instagram',
    handle: body.handle || 'instagram_account',
    displayName: body.handle ? `@${body.handle.replace(/^@/, '')}` : '@instagram_account',
    status: 'connected',
    source: 'oauth-return',
  })

  if (!connection) {
    return NextResponse.json(
      {
        error:
          'Could not save Instagram connection in MarketMe. Apply migration 027_business_social_connections.sql, then try again.',
      },
      { status: 500 }
    )
  }

  // Kick brand-brain enrich (profile + IG handle + website → strategy fuel).
  const { scheduleBrandIntelligenceRefresh } = await import(
    '@/lib/services/brand-intelligence.service'
  )
  scheduleBrandIntelligenceRefresh({
    businessProfileId: profile.id,
    userId: session.user.id,
  })

  return NextResponse.json({
    success: true,
    connection,
    connections: [connection],
  })
}
