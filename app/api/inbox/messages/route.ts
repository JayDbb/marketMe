import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  getInboxMessages,
  getSocialConnections,
  markInboxMessageReadAi,
  MarketingAIError,
  replyToInboxMessageAi,
  type RawSocialConnection,
} from '@/lib/services/marketing-ai.service'
import {
  listInboxMessages,
  markInboxMessageReadLocal,
  upsertInboxMessages,
} from '@/lib/services/inbox.service'
import {
  listMirroredConnections,
  mergeRemoteAndMirrored,
} from '@/lib/services/social-connections.service'
import { getInstagramAccountLabel } from '@/lib/social/instagram-account'
import { mapRawInboxPayload } from '@/lib/social/map-inbox'
import { mapRawConnection, normalizeInstagramHandle } from '@/lib/social/oauth'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'
import type { SocialConnection } from '@/types/social'

export const runtime = 'nodejs'

export type InboxSyncStatus =
  | 'ok'
  | 'empty'
  | 'needs_reconnect'
  | 'inbox_unavailable'
  | 'unreachable'

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

async function resolveContext() {
  const session = await requireAuth()
  rateLimitOrThrow(`inbox:${session.user.id}`, 40, 60_000)

  const { data: profile, error: profileError } = await getBusinessProfile(
    session.user.id
  )
  if (profileError) {
    throw Object.assign(new Error(profileError), { status: 500 })
  }
  if (!profile) {
    throw Object.assign(
      new Error('Complete your business profile before opening the inbox.'),
      { status: 404 }
    )
  }

  const mirrored = await listMirroredConnections(profile.id, session.user.id)
  let remote: SocialConnection[] = []
  let remoteError: string | null = null
  try {
    const raw = await getSocialConnections(profile.id)
    remote = mapConnections(Array.isArray(raw) ? raw : [])
  } catch (error) {
    remoteError =
      error instanceof Error ? error.message : 'Failed to reach publish service'
  }

  const connections = mergeRemoteAndMirrored(remote, mirrored)
  const instagram = connections.find(
    (c) => c.platform === 'instagram' && c.status === 'connected'
  )
  const remoteInstagram = remote.find(
    (c) => c.platform === 'instagram' && c.status === 'connected'
  )

  return {
    session,
    profile,
    instagram,
    remoteInstagram,
    remoteError,
    mirroredOnly: Boolean(instagram && !remoteInstagram && !remoteError),
  }
}

function accountPayload(instagram: SocialConnection) {
  const account = getInstagramAccountLabel(instagram)
  return {
    connectionId: instagram.id,
    handle: normalizeInstagramHandle(instagram.handle) || null,
    displayName: account.title,
    atHandle: account.atHandle,
    profileUrl: account.profileUrl,
  }
}

/** List Instagram inbox messages for the signed-in user's connected account. */
export async function GET() {
  try {
    const {
      session,
      profile,
      instagram,
      remoteInstagram,
      remoteError,
      mirroredOnly,
    } = await resolveContext()

    if (!instagram) {
      return NextResponse.json(
        {
          error: 'Connect Instagram on the Connections page to open your inbox.',
          messages: [],
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

    // Mirror says connected, but publish service has no Instagram token.
    if (mirroredOnly) {
      return NextResponse.json({
        messages: local,
        connected: true,
        source: local.length > 0 ? 'local' : 'empty',
        syncStatus: 'needs_reconnect' satisfies InboxSyncStatus,
        warning:
          'Instagram is marked connected in MarketMe, but the publish service has no token for this account. Reconnect Instagram to enable inbox sync.',
        account: accountPayload(instagram),
        businessProfileId: profile.id,
      })
    }

    if (remoteError && !remoteInstagram) {
      return NextResponse.json({
        messages: local,
        connected: true,
        source: local.length > 0 ? 'local' : 'empty',
        syncStatus: 'unreachable' satisfies InboxSyncStatus,
        warning: `Could not reach the publish service to load inbox. ${remoteError.replace(/^MarketMe[- ]?AI error:\s*/i, '')}`,
        account: accountPayload(instagram),
        businessProfileId: profile.id,
      })
    }

    // Prefer the richer remote account (real @handle) when available.
    const activeAccount = remoteInstagram || instagram
    let remoteMessages = mapRawInboxPayload(null, {
      connectionId: activeAccount.id,
      platform: 'instagram',
    })
    let source: 'marketme-ai' | 'local' | 'empty' = 'empty'
    let syncStatus: InboxSyncStatus = 'empty'
    let warning: string | undefined

    try {
      const raw = await getInboxMessages(profile.id, { platform: 'instagram' })
      remoteMessages = mapRawInboxPayload(raw, {
        connectionId: activeAccount.id,
        platform: 'instagram',
      })
      if (remoteMessages.length > 0) {
        await upsertInboxMessages({
          businessProfileId: profile.id,
          userId: session.user.id,
          connectionId: activeAccount.id,
          messages: remoteMessages,
        })
        source = 'marketme-ai'
        syncStatus = 'ok'
      } else {
        syncStatus = 'empty'
      }
    } catch (error) {
      const message =
        error instanceof MarketingAIError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to sync Instagram inbox'
      console.error('[inbox/messages]', message)

      const isMissingEndpoint =
        error instanceof MarketingAIError &&
        (error.status === 404 || /not found/i.test(message))

      if (isMissingEndpoint) {
        syncStatus = 'inbox_unavailable'
        warning = activeAccount
          ? `Your Instagram account is linked${normalizeInstagramHandle(activeAccount.handle) ? ` as @${normalizeInstagramHandle(activeAccount.handle)}` : ''}, but live DM/comment sync is not enabled on the publish API yet.`
          : 'Live DM/comment sync is not enabled on the publish API yet.'
      } else {
        syncStatus = 'unreachable'
        warning = `Could not refresh Instagram inbox. ${message.replace(/^MarketMe[- ]?AI error:\s*/i, '')}`
      }
    }

    const messages = remoteMessages.length > 0 ? remoteMessages : local
    if (remoteMessages.length === 0 && local.length > 0) source = 'local'
    if (syncStatus === 'empty' && messages.length > 0) syncStatus = 'ok'

    return NextResponse.json({
      messages,
      connected: true,
      source,
      syncStatus,
      warning,
      account: accountPayload(activeAccount),
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
      },
      { status }
    )
  }
}

/** Mark read or reply to an inbox message. */
export async function POST(request: NextRequest) {
  try {
    const { session, profile, instagram, mirroredOnly } = await resolveContext()
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
      action?: 'mark_read' | 'reply'
      messageId?: string
      body?: string
    }

    const messageId = body.messageId?.trim()
    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 })
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
