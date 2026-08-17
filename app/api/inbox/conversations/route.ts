import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/services/auth.service'
import { getInboxConversations } from '@/lib/services/marketing-ai.service'
import {
  inboxAccountPayload,
  inboxUnavailableMessage,
  resolveInboxContext,
  type InboxSyncStatus,
} from '@/lib/services/inbox-context'
import { mapRawConversationsPayload } from '@/lib/social/map-inbox'
import { isRateLimitError } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/** List Instagram inbox conversation threads. */
export async function GET() {
  try {
    const {
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
    const status =
      typeof (e as { status?: number })?.status === 'number'
        ? (e as { status: number }).status
        : 500
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Failed to load conversations',
        conversations: [],
      },
      { status }
    )
  }
}
