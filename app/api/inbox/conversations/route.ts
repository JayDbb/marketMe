import { NextRequest, NextResponse } from 'next/server'
import { AuthError } from '@/lib/services/auth.service'
import {
  getInboxConversation,
  getInboxConversations,
  MarketingAIError,
  replyToInboxConversationAi,
  replyToInboxMessageAi,
} from '@/lib/services/marketing-ai.service'
import {
  inboxAccountPayload,
  inboxUnavailableMessage,
  explainInboxReplyError,
  publicInboxError,
  resolveInboxContext,
  type InboxSyncStatus,
} from '@/lib/services/inbox-context'
import {
  mapRawConversationPayload,
  mapRawConversationsPayload,
} from '@/lib/social/map-inbox'
import { isRateLimitError } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function blockedInboxResponse(instagram: unknown, mirroredOnly: boolean) {
  if (!instagram) {
    return NextResponse.json(
      {
        error: 'Connect Instagram on the Connections page to open your inbox.',
        conversations: [],
        connected: false,
        syncStatus: 'empty' satisfies InboxSyncStatus,
      },
      { status: 404 }
    )
  }
  if (mirroredOnly) {
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

/** List threads, or load one thread with ?id= to avoid putting Meta IDs in the path. */
export async function GET(request: NextRequest) {
  try {
    const {
      profile,
      instagram,
      remoteInstagram,
      remoteError,
      mirroredOnly,
    } = await resolveInboxContext()

    const blocked = blockedInboxResponse(instagram, mirroredOnly)
    if (blocked && (!instagram || mirroredOnly)) return blocked

    if (!instagram) {
      return NextResponse.json(
        {
          error: 'Connect Instagram on the Connections page to open your inbox.',
          conversations: [],
          connected: false,
          syncStatus: 'empty' satisfies InboxSyncStatus,
        },
        { status: 404 }
      )
    }

    if (mirroredOnly) {
      return NextResponse.json({
        conversations: [],
        connected: true,
        syncStatus: 'needs_reconnect' satisfies InboxSyncStatus,
        warning:
          'Instagram is marked connected in MarketMe, but the publish service has no token for this account. Reconnect Instagram to enable inbox sync.',
        account: inboxAccountPayload(instagram),
        businessProfileId: profile.id,
      })
    }

    if (remoteError && !remoteInstagram) {
      return NextResponse.json({
        conversations: [],
        connected: true,
        syncStatus: 'unreachable' satisfies InboxSyncStatus,
        warning: `Could not reach the publish service to load inbox. ${remoteError.replace(/^MarketMe[- ]?AI error:\s*/i, '')}`,
        account: inboxAccountPayload(instagram),
        businessProfileId: profile.id,
      })
    }

    const activeAccount = remoteInstagram || instagram
    const conversationId = request.nextUrl.searchParams.get('id')?.trim()

    if (conversationId) {
      try {
        const raw = await getInboxConversation(profile.id, conversationId)
        const conversation = mapRawConversationPayload(raw, {
          connectionId: activeAccount.id,
          platform: 'instagram',
        })
        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }
        return NextResponse.json({
          conversation,
          connected: true,
          account: inboxAccountPayload(activeAccount),
          businessProfileId: profile.id,
        })
      } catch (error) {
        const { message } = inboxUnavailableMessage(error)
        return NextResponse.json(
          { error: publicInboxError(error, message), conversation: null },
          { status: 200 }
        )
      }
    }

    try {
      const raw = await getInboxConversations(profile.id, { platform: 'instagram' })
      const conversations = mapRawConversationsPayload(raw, {
        connectionId: activeAccount.id,
        platform: 'instagram',
      })

      return NextResponse.json({
        conversations,
        connected: true,
        syncStatus: conversations.length > 0 ? 'ok' : 'empty',
        account: inboxAccountPayload(activeAccount),
        businessProfileId: profile.id,
      })
    } catch (error) {
      const { missingEndpoint, message } = inboxUnavailableMessage(error)
      console.error('[inbox/conversations]', {
        outcome: missingEndpoint ? 'inbox_unavailable' : 'unreachable',
        businessProfileId: profile.id,
        message,
      })
      return NextResponse.json({
        conversations: [],
        connected: true,
        syncStatus: missingEndpoint ? 'inbox_unavailable' : 'unreachable',
        warning: missingEndpoint
          ? 'Conversation threads are not enabled on the publish API yet.'
          : `Could not refresh Instagram conversations. ${message.replace(/^MarketMe[- ]?AI error:\s*/i, '')}`,
        account: inboxAccountPayload(activeAccount),
        businessProfileId: profile.id,
      })
    }
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
    const status =
      typeof (e as { status?: number })?.status === 'number'
        ? (e as { status: number }).status
        : 500
    return NextResponse.json(
      {
        error: publicInboxError(e, 'Failed to load conversations'),
        conversations: [],
      },
      { status: status === 404 ? 404 : 502 }
    )
  }
}

/**
 * Reply to a thread. IDs go in the JSON body so Instagram/Meta ids cannot
 * break the URL. Falls back to the message reply endpoint if conversation
 * reply fails.
 */
export async function POST(request: NextRequest) {
  try {
    const { profile, instagram, mirroredOnly } = await resolveInboxContext()
    const blocked = blockedInboxResponse(instagram, mirroredOnly)
    if (blocked) return blocked

    const payload = (await request.json().catch(() => ({}))) as {
      conversationId?: string
      messageId?: string
      recipientId?: string
      lastInboundAt?: string
      body?: string
    }
    const replyBody = payload.body?.trim() || ''
    const conversationId = payload.conversationId?.trim() || ''
    const messageId = payload.messageId?.trim() || ''
    const recipientId = payload.recipientId?.trim() || ''
    const lastInboundAt = payload.lastInboundAt?.trim() || ''

    if (!replyBody) {
      return NextResponse.json({ error: 'Reply body is required' }, { status: 400 })
    }
    if (!conversationId && !messageId) {
      return NextResponse.json(
        { error: 'conversationId or messageId is required' },
        { status: 400 }
      )
    }

    let via: 'conversation' | 'message' | null = null
    let lastError: unknown = null

    // Prefer message reply so Instagram treats this as a response to their DM,
    // not a new outbound message (which Meta rejects as outside the window).
    if (messageId) {
      try {
        await replyToInboxMessageAi({
          businessProfileId: profile.id,
          messageId,
          body: replyBody,
          recipientId,
        })
        via = 'message'
      } catch (error) {
        lastError = error
      }
    }

    if (!via && conversationId) {
      try {
        await replyToInboxConversationAi({
          businessProfileId: profile.id,
          conversationId,
          body: replyBody,
          recipientId,
        })
        via = 'conversation'
      } catch (error) {
        lastError = error
      }
    }

    if (!via) {
      const message = explainInboxReplyError(lastError, { lastInboundAt })
      const status =
        lastError instanceof MarketingAIError && lastError.status === 404
          ? 501
          : 400
      console.error('[inbox/conversations/reply]', {
        businessProfileId: profile.id,
        conversationIdLength: conversationId.length,
        hasMessageId: Boolean(messageId),
        hasRecipientId: Boolean(recipientId),
        lastInboundAt: lastInboundAt || null,
        status,
        message,
      })
      return NextResponse.json({ error: message }, { status })
    }

    return NextResponse.json({
      success: true,
      conversationId: conversationId || null,
      messageId: messageId || null,
      via,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    return NextResponse.json(
      { error: publicInboxError(e, 'Conversation reply failed') },
      { status: 400 }
    )
  }
}
