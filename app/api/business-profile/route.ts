import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { getBusinessProfile, upsertBusinessProfile } from '@/lib/services/business.service'
import type { BusinessProfileInput } from '@/types/business-profile'

/**
 * GET /api/business-profile
 * Returns the authenticated user's business profile.
 */
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

  const { data, error } = await getBusinessProfile(session.user.id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'No business profile found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

/**
 * PUT /api/business-profile
 * Creates or updates the authenticated user's business profile.
 */
export async function PUT(request: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
  }

  let body: BusinessProfileInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { data, error } = await upsertBusinessProfile(session.user.id, body)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ data })
}
