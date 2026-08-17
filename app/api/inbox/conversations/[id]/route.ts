import { NextRequest, NextResponse } from 'next/server'
import { AuthError } from '@/lib/services/auth.service'
import {
  getInboxConversation,
  MarketingAIError,
  replyToInboxConversationAi,
} from '@/lib/services/marketing-ai.service'
import {
  inboxAccountPayload,
  resolveInboxContext,
  type InboxRouteContext,
} from '@/lib/services/inbox-context'
import { mapRawConversationPayload } from '@/lib/social/map-inbox'
import { isRateLimitError } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function connectedOrError(context: InboxRouteContext) {
  if (!context.instagram) {
    return NextResponse.json(
      { error: 'Connect Instagram before opening a conversation.' },
      { status: 404 }
    )
  }
  if (context.mirroredOnly) {
    return NextResponse.json(
      {
        error:
          'Reconnect Instagram first — the publish service has no token for this account yet.',
      },
      { status: 409 }
    )
  }
  return null
}

/** Load one Instagram conversation thread. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await resolveInboxContext()
    const blocked = connectedOrError(context)
    if (blocked) return blocked

    const { profile, instagram, remoteInstagram } = context
    const { id } = await params
    const conversationId = id?.trim()
    if (!conversationId) {
      return NextResponse.json({ error: 'conversation id is required' }, { status: 400 })
    }

    const activeAccount = remoteInstagram || instagram
    if (!activeAccount) {
      return NextResponse.json(
        { error: 'Connect Instagram before opening a conversation.' },
        { status: 404 }
      )
    }

    const raw = await getInboxConversation(profile.id, conversationId)
    const conversation = mapRawConversationPayload(raw, {
      connectionId: activeAccount.id,
      platform: 'instagram',
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      conversation,
      connected: true,
      account: inboxAccountPayload(activeAccount),
      businessProfileId: profile.id,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    if (e instanceof MarketingAIError && e.status === 404) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load conversation' },
      { status: 502 }
    )
  }
}

/** Reply in an Instagram conversation thread. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await resolveInboxContext()
    const blocked = connectedOrError(context)
    if (blocked) return blocked

    const { id } = await params
    const conversationId = id?.trim()
    if (!conversationId) {
      return NextResponse.json({ error: 'conversation id is required' }, { status: 400 })
    }

    const body = (await request.json().catch(() => ({}))) as { body?: string }
    const replyBody = body.body?.trim() || ''
    if (!replyBody) {
      return NextResponse.json({ error: 'Reply body is required' }, { status: 400 })
    }

    try {
      await replyToInboxConversationAi({
        businessProfileId: context.profile.id,
        conversationId,
        body: replyBody,
      })
    } catch (error) {
      if (error instanceof MarketingAIError && error.status === 404) {
        return NextResponse.json(
          { error: 'Conversation reply is not available yet on the Instagram publish service.' },
          { status: 501 }
        )
      }
      const message = error instanceof Error ? error.message : 'Failed to send reply'
      return NextResponse.json({ error: message }, { status: 502 })
    }

    return NextResponse.json({ success: true, conversationId })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Conversation reply failed' },
      { status: 500 }
    )
  }
}
