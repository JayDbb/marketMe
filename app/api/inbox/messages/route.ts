import { NextRequest, NextResponse } from 'next/server'
import { AuthError } from '@/lib/services/auth.service'
import {
  getInboxConversations,
  getInboxMessages,
  markInboxMessageReadAi,
  MarketingAIError,
  replyToInboxMessageAi,
} from '@/lib/services/marketing-ai.service'
import {
  archiveInboxMessageLocal,
  listInboxMessages,
  markInboxMessageReadLocal,
  upsertInboxMessages,
} from '@/lib/services/inbox.service'
import {
  overlayConversationStatus,
  overlayLocalInboxStatus,
} from '@/lib/inbox-utils'
import {
  inboxAccountPayload,
  inboxUnavailableMessage,
  resolveInboxContext,
  type InboxSyncStatus,
} from '@/lib/services/inbox-context'
import {
  mapRawConversationsPayload,
  mapRawInboxPayload,
} from '@/lib/social/map-inbox'
import { normalizeInstagramHandle } from '@/lib/social/oauth'
import { isRateLimitError } from '@/lib/rate-limit'
import type { InboxConversation, InboxMessage } from '@/types/social'

export const runtime = 'nodejs'

export type { InboxSyncStatus }

/** List Instagram inbox messages and conversations for the signed-in user. */
export async function GET() {
  try {
    const {
      session,
      profile,
      instagram,
      remoteInstagram,
      remoteError,
      mirroredOnly,
    } = await resolveInboxContext()

    if (!instagram) {
      return NextResponse.json(
        {
          error: 'Connect Instagram on the Connections page to open your inbox.',
          messages: [],
          conversations: [],
          connected: false,
          syncStatus: 'empty',
        },
        { status: 404 }
      )
    }

    const local = await listInboxMessages({
      businessProfileId: profile.id,
      userId: session.user.id,
      platform: 'instagram',
    })

    if (mirroredOnly) {
      return NextResponse.json({
        messages: local,
        conversations: [],
        connected: true,
        source: local.length > 0 ? 'local' : 'empty',
        syncStatus: 'needs_reconnect' satisfies InboxSyncStatus,
        warning:
          'Instagram is marked connected in MarketMe, but the publish service has no token for this account. Reconnect Instagram to enable inbox sync.',
        account: inboxAccountPayload(instagram),
        businessProfileId: profile.id,
      })
    }

    if (remoteError && !remoteInstagram) {
      return NextResponse.json({
        messages: local,
        conversations: [],
        connected: true,
        source: local.length > 0 ? 'local' : 'empty',
        syncStatus: 'unreachable' satisfies InboxSyncStatus,
        warning: `Could not reach the publish service to load inbox. ${remoteError.replace(/^MarketMe[- ]?AI error:\s*/i, '')}`,
        account: inboxAccountPayload(instagram),
        businessProfileId: profile.id,
      })
    }

    const activeAccount = remoteInstagram || instagram
    const fallback = {
      connectionId: activeAccount.id,
      platform: 'instagram' as const,
    }

    const [messagesOutcome, conversationsOutcome] = await Promise.allSettled([
      getInboxMessages(profile.id, { platform: 'instagram' }),
      getInboxConversations(profile.id, { platform: 'instagram' }),
    ])

    let remoteMessages: InboxMessage[] = []
    let conversations: InboxConversation[] = []
    let source: 'marketme-ai' | 'local' | 'empty' = 'empty'
    let syncStatus: InboxSyncStatus = 'empty'
    let warning: string | undefined
    const failures: unknown[] = []

    if (messagesOutcome.status === 'fulfilled') {
      remoteMessages = mapRawInboxPayload(messagesOutcome.value, fallback)
    } else {
      failures.push(messagesOutcome.reason)
    }

    if (conversationsOutcome.status === 'fulfilled') {
      conversations = mapRawConversationsPayload(
        conversationsOutcome.value,
        fallback
      )
    } else {
      failures.push(conversationsOutcome.reason)
    }

    let localMessages = local
    if (remoteMessages.length > 0) {
      await upsertInboxMessages({
        businessProfileId: profile.id,
        userId: session.user.id,
        connectionId: activeAccount.id,
        messages: remoteMessages,
      })
      localMessages = await listInboxMessages({
        businessProfileId: profile.id,
        userId: session.user.id,
        platform: 'instagram',
      })
    }

    const hasRemote = remoteMessages.length > 0 || conversations.length > 0
    if (hasRemote) {
      source = 'marketme-ai'
      syncStatus = 'ok'
    } else if (failures.length > 0) {
      const first = failures[0]
      const { missingEndpoint, message } = inboxUnavailableMessage(first)
      const allMissing = failures.every((error) => inboxUnavailableMessage(error).missingEndpoint)
      console.error('[inbox/messages]', {
        outcome: allMissing || missingEndpoint ? 'inbox_unavailable' : 'unreachable',
        businessProfileId: profile.id,
        failedCount: failures.length,
        message,
      })
      if (allMissing || missingEndpoint) {
        syncStatus = 'inbox_unavailable'
        warning = activeAccount
          ? `Your Instagram account is linked${normalizeInstagramHandle(activeAccount.handle) ? ` as @${normalizeInstagramHandle(activeAccount.handle)}` : ''}, but live DM/comment sync is not enabled on the publish API yet.`
          : 'Live DM/comment sync is not enabled on the publish API yet.'
      } else {
        syncStatus = 'unreachable'
        warning = `Could not refresh Instagram inbox. ${message.replace(/^MarketMe[- ]?AI error:\s*/i, '')}`
      }
    }

    const messages =
      remoteMessages.length > 0
        ? overlayLocalInboxStatus(remoteMessages, localMessages)
        : localMessages
    conversations = overlayConversationStatus(conversations, localMessages)
    if (remoteMessages.length === 0 && localMessages.length > 0) source = 'local'
    if (syncStatus === 'empty' && (messages.length > 0 || conversations.length > 0)) {
      syncStatus = 'ok'
    }

    return NextResponse.json({
      messages,
      conversations,
      connected: true,
      source,
      syncStatus,
      warning,
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
    const status =
      typeof (e as { status?: number })?.status === 'number'
        ? (e as { status: number }).status
        : 500
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Failed to load inbox',
        messages: [],
        conversations: [],
      },
      { status }
    )
  }
}

/** Mark read or reply to an inbox message. */
export async function POST(request: NextRequest) {
  try {
    const { session, profile, instagram, mirroredOnly } = await resolveInboxContext()
    if (!instagram) {
      return NextResponse.json(
        { error: 'Connect Instagram before managing inbox messages.' },
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

    const body = (await request.json().catch(() => ({}))) as {
      action?: 'mark_read' | 'reply' | 'archive'
      messageId?: string
      body?: string
    }

    const messageId = body.messageId?.trim()
    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 })
    }

    if (body.action === 'archive') {
      const archived = await archiveInboxMessageLocal({
        businessProfileId: profile.id,
        userId: session.user.id,
        messageId,
      })
      if (!archived) {
        return NextResponse.json(
          { error: 'Could not mark this item done.' },
          { status: 500 }
        )
      }
      return NextResponse.json({ success: true })
    }

    if (body.action === 'reply') {
      const replyBody = body.body?.trim() || ''
      if (!replyBody) {
        return NextResponse.json({ error: 'Reply body is required' }, { status: 400 })
      }

      try {
        await replyToInboxMessageAi({
          businessProfileId: profile.id,
          messageId,
          body: replyBody,
        })
      } catch (error) {
        if (error instanceof MarketingAIError && error.status === 404) {
          return NextResponse.json(
            {
              error:
                'Reply is not available yet on the Instagram publish service.',
            },
            { status: 501 }
          )
        }
        const message =
          error instanceof Error ? error.message : 'Failed to send reply'
        return NextResponse.json({ error: message }, { status: 502 })
      }

      await markInboxMessageReadLocal({
        businessProfileId: profile.id,
        userId: session.user.id,
        messageId,
      })

      return NextResponse.json({ success: true })
    }

    await markInboxMessageReadLocal({
      businessProfileId: profile.id,
      userId: session.user.id,
      messageId,
    })

    try {
      await markInboxMessageReadAi({
        businessProfileId: profile.id,
        messageId,
      })
    } catch {
      // Local status is enough for UI; remote mark-read is best-effort.
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Inbox action failed' },
      { status: 500 }
    )
  }
}
