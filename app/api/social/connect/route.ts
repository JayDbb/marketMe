import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import { toAiBusinessId } from '@/lib/ai-business-id'
import {
  getInstagramOAuthUrl,
  MarketingAIError,
} from '@/lib/services/marketing-ai.service'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'
import type { SocialPlatform } from '@/types/social'

export const runtime = 'nodejs'

const SUPPORTED: SocialPlatform[] = ['instagram']

async function startInstagramOAuth(userId: string) {
  const { data: profile, error: profileError } = await getBusinessProfile(userId)
  if (profileError) {
    return { error: profileError, status: 500 as const }
  }
  if (!profile) {
    return {
      error: 'Complete your business profile before connecting Instagram.',
      status: 404 as const,
    }
  }

  const authUrl = await getInstagramOAuthUrl(toAiBusinessId(profile.id))
  if (!authUrl) {
    return { error: 'Auth URL was empty', status: 502 as const }
  }

  return {
    authUrl,
    businessProfileId: profile.id,
    platform: 'instagram' as const,
  }
}

/** Authenticated: return Meta OAuth URL scoped to the signed-in user's business. */
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
    rateLimitOrThrow(`social:connect:${session.user.id}`, 10, 15 * 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  let body: { platform?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const platform = body.platform as SocialPlatform | undefined
  if (!platform || !SUPPORTED.includes(platform)) {
    return NextResponse.json(
      { error: 'Only Instagram connect via Meta OAuth is supported right now.' },
      { status: 400 }
    )
  }

  try {
    const result = await startInstagramOAuth(session.user.id)
    if ('error' in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof MarketingAIError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to start OAuth'
    console.error('[social/connect]', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * Optional GET: redirect straight into Meta OAuth (useful for links / debugging).
 * Prefer POST from the Connections UI so errors can be shown in-page.
 */
export async function GET(request: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      const login = new URL('/login', request.url)
      login.searchParams.set('callbackUrl', '/dashboard/connections')
      return NextResponse.redirect(login)
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    rateLimitOrThrow(`social:connect:${session.user.id}`, 10, 15 * 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  try {
    const result = await startInstagramOAuth(session.user.id)
    if ('error' in result && result.error) {
      const dest = new URL('/dashboard/connections', request.url)
      dest.searchParams.set('oauth', 'instagram')
      dest.searchParams.set('status', 'error')
      dest.searchParams.set('error', result.error)
      return NextResponse.redirect(dest)
    }
    if (!('authUrl' in result) || !result.authUrl) {
      return NextResponse.json({ error: 'Missing auth URL' }, { status: 502 })
    }
    return NextResponse.redirect(result.authUrl)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to start OAuth'
    const dest = new URL('/dashboard/connections', request.url)
    dest.searchParams.set('oauth', 'instagram')
    dest.searchParams.set('status', 'error')
    dest.searchParams.set('error', message)
    return NextResponse.redirect(dest)
  }
}
