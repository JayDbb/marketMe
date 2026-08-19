'use client'

import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Check,
  ExternalLink,
  Info,
  Link2,
  Loader2,
  RefreshCw,
  Unplug,
} from 'lucide-react'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import { getInstagramAccountLabel } from '@/lib/social/instagram-account'
import {
  consumeInstagramOAuthPending,
  parseOAuthReturnParams,
  stripOAuthReturnParams,
} from '@/lib/social/oauth'
import {
  getInstagramHealth,
  instagramHealthLabel,
  META_BUSINESS_INTEGRATIONS_URL,
  type InstagramHealth,
} from '@/lib/connection-utils'
import { cn } from '@/lib/utils'
import type { SocialConnection } from '@/types/social'

type OAuthNotice = {
  tone: 'error' | 'info'
  title: string
  body: string
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

function ChannelAvatar({
  name,
  src,
}: {
  name: string
  src?: string | null
}) {
  const initial = (name.replace(/^@/, '').trim().charAt(0) || 'I').toUpperCase()
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-700 dark:text-sky-300"
    >
      {initial}
    </div>
  )
}

function HealthChip({ health }: { health: InstagramHealth }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        health === 'connected'
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : health === 'saved_locally' || health === 'needs_reconnect'
            ? 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
            : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45'
      )}
    >
      {instagramHealthLabel(health)}
    </span>
  )
}

function OAuthReturnHandler({
  onNotice,
}: {
  onNotice: (notice: OAuthNotice | null) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { refresh, confirmOAuthSuccess } = useSocialConnections()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return

    const result = parseOAuthReturnParams(searchParams)
    const pending = consumeInstagramOAuthPending()
    if (result.kind === 'none' && !pending) return

    handled.current = true

    void (async () => {
      if (result.kind === 'error') {
        onNotice({
          tone: 'error',
          title: 'Instagram connection failed',
          body: `${result.message} Use an Instagram Business or Creator account linked to a Facebook Page you admin, then try Connect again.`,
        })
        await refresh()
      } else if (result.kind === 'success') {
        const handle = result.handle
        const confirmed = await confirmOAuthSuccess('instagram', handle)
        if (confirmed.ok) {
          toast.success(
            handle
              ? `Connected @${handle}`
              : result.message || 'Instagram connected'
          )
          if (confirmed.warning) {
            onNotice({
              tone: 'info',
              title: 'Saved in MarketMe',
              body: confirmed.warning,
            })
          } else {
            onNotice(null)
          }
        } else {
          const refreshed = await refresh()
          if (refreshed.ok) {
            toast.success('Instagram authorized')
            onNotice(null)
          } else {
            onNotice({
              tone: 'error',
              title: 'Could not save Instagram',
              body: confirmed.error || refreshed.error,
            })
          }
        }
      } else if (pending) {
        await refresh()
        onNotice({
          tone: 'info',
          title: 'Instagram connection was not completed',
          body: 'No OAuth result was returned. Try Connect again.',
        })
      }

      if (result.kind !== 'none') {
        router.replace(`${pathname}${stripOAuthReturnParams(searchParams)}`)
      }
    })()
  }, [searchParams, refresh, confirmOAuthSuccess, router, pathname, onNotice])

  return null
}

function ConnectionsSkeleton() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-white/10">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function PreConnectChecklist() {
  const items = [
    'Instagram is a Business or Creator account, not a personal profile',
    'That Instagram is linked to a Facebook Page',
    'You have full control (admin) on that Page',
    'You are logged into that Facebook account in this browser',
  ]
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#0f1117]">
      <p className="mb-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-white/35">
        Before you connect
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2.5 text-sm text-zinc-600 dark:text-white/60"
          >
            <Check
              className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-zinc-400 dark:text-white/35">
        Personal profiles and Facebook-only logins fail Meta’s check.{' '}
        <Link
          href="/blog/connecting-instagram-the-right-way"
          className="font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          How OAuth works
        </Link>
        {' · '}
        <Link
          href="/help"
          className="font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          Help
        </Link>
      </p>
    </div>
  )
}

function rowSubtitle(
  health: InstagramHealth,
  account: ReturnType<typeof getInstagramAccountLabel> | null
): string {
  if (health === 'not_connected') return 'Not connected'
  if (health === 'needs_reconnect') {
    return account?.isPlaceholder
      ? 'Username missing — reconnect with a Business or Creator account tied to a Facebook Page'
      : 'Reconnect so Meta can issue a fresh token'
  }
  if (health === 'saved_locally') {
    return 'Saved in MarketMe. Publish and Inbox cannot verify this with Meta yet.'
  }
  return account?.subtitle ?? 'Business / Creator account'
}

function InstagramRow({
  connection,
  health,
  connecting,
  onConnect,
  onDisconnect,
}: {
  connection: SocialConnection | null
  health: InstagramHealth
  connecting: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const account = connection ? getInstagramAccountLabel(connection) : null
  const verifiedAt = connection?.lastSyncedAt || connection?.connectedAt
  const title = account?.title ?? 'Instagram'
  const relative = verifiedAt ? formatDistanceToNow(verifiedAt) : ''

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0f1117]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {connection && health !== 'not_connected' ? (
            <ChannelAvatar name={title} src={connection.avatarUrl} />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
              <InstagramGlyph className="size-5" />
            </div>
          )}
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                Instagram
              </p>
              <HealthChip health={health} />
            </div>
            <p className="text-sm text-zinc-800 dark:text-white/80">{title}</p>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-white/40">
              {rowSubtitle(health, account)}
            </p>
            {health !== 'not_connected' && relative ? (
              <p className="text-[11px] text-zinc-400 dark:text-white/30">
                Last verified {relative}
                {relative === 'just now' ? '' : ' ago'}
              </p>
            ) : null}
            {account?.profileUrl ? (
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                View on Instagram
                <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {health === 'not_connected' ? (
            <Button
              type="button"
              className="h-10 rounded-xl px-5 font-semibold"
              disabled={connecting}
              onClick={onConnect}
            >
              {connecting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Link2 className="mr-2 size-4" />
              )}
              Connect Instagram
            </Button>
          ) : !confirming ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-zinc-200 dark:border-white/12"
                disabled={connecting}
                onClick={onConnect}
              >
                {connecting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" />
                )}
                Reconnect
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl text-zinc-500 hover:text-red-600 dark:text-white/50 dark:hover:text-red-400"
                onClick={() => setConfirming(true)}
              >
                <Unplug className="mr-2 size-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <div className="w-full max-w-sm rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-500/10 sm:w-72">
              <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
                Remove {account?.atHandle ?? 'this Instagram account'} from
                MarketMe? This does not revoke Meta tokens. To cut access, also
                remove MarketMe in{' '}
                <a
                  href={META_BUSINESS_INTEGRATIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2"
                >
                  Meta Business Integrations
                </a>
                .
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8 flex-1 rounded-lg text-xs"
                  onClick={() => {
                    setConfirming(false)
                    onDisconnect()
                  }}
                >
                  Remove from MarketMe
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-lg text-xs"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConnectionsInner({
  oauthNotice,
}: {
  oauthNotice: OAuthNotice | null
}) {
  const {
    isLoading,
    connectingPlatform,
    error,
    warning,
    source,
    connect,
    disconnect,
    refresh,
    getConnection,
  } = useSocialConnections()

  const instagram = getConnection('instagram') ?? null
  const health = useMemo(
    () =>
      getInstagramHealth({
        connection: instagram,
        source,
        warning,
        error,
      }),
    [instagram, source, warning, error]
  )

  const banner =
    oauthNotice ??
    (error
      ? {
          tone: 'error' as const,
          title:
            health === 'not_connected'
              ? 'Could not verify Instagram with the publish service'
              : 'Publish sync needs attention',
          body: error,
        }
      : warning
        ? {
            tone: 'info' as const,
            title:
              health === 'saved_locally'
                ? 'Saved in MarketMe — not verified with Meta'
                : 'Instagram needs attention',
            body: warning,
          }
        : null)

  const connectedHandle = instagram
    ? getInstagramAccountLabel(instagram).atHandle
    : null
  const subtitle =
    health === 'connected'
      ? `Publishing, scheduling, and inbox for ${connectedHandle ?? 'Instagram'}.`
      : health === 'saved_locally'
        ? 'Saved in MarketMe. Reconnect so Posts, Planner, and Inbox can verify with Meta.'
        : health === 'needs_reconnect'
          ? 'Reconnect Instagram before you publish or open Inbox.'
          : 'Connect Instagram to unlock Posts, Planner, and Inbox.'

  if (isLoading) {
    return <ConnectionsSkeleton />
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium tracking-widest text-sky-600 uppercase dark:text-sky-400/80">
          Social
        </p>
        <h1 className="text-pretty text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
          Connections
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-white/45">
          {subtitle}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Link
            href="/dashboard/posts"
            className="text-sky-600 hover:underline dark:text-sky-400"
          >
            Posts
          </Link>
          <Link
            href="/dashboard/calendar"
            className="text-sky-600 hover:underline dark:text-sky-400"
          >
            Planner
          </Link>
          <Link
            href="/dashboard/inbox"
            className="text-sky-600 hover:underline dark:text-sky-400"
          >
            Inbox
          </Link>
        </div>
      </div>

      {banner ? (
        <div
          role="status"
          className={cn(
            'mb-6 flex gap-3 rounded-xl border px-4 py-3',
            banner.tone === 'error'
              ? 'border-amber-500/25 bg-amber-500/8'
              : 'border-sky-500/25 bg-sky-500/8'
          )}
        >
          <Info
            className={cn(
              'mt-0.5 size-5 shrink-0',
              banner.tone === 'error' ? 'text-amber-500' : 'text-sky-500'
            )}
          />
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {banner.title}
            </p>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-white/45">
              {banner.body}
            </p>
            {error ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => void refresh()}
              >
                <RefreshCw className="mr-1.5 size-3.5" />
                Retry
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <InstagramRow
        connection={instagram}
        health={health}
        connecting={connectingPlatform === 'instagram'}
        onConnect={() => void connect('instagram')}
        onDisconnect={() => {
          if (instagram) void disconnect(instagram.id)
        }}
      />

      {health === 'not_connected' ? (
        <div className="mt-6">
          <PreConnectChecklist />
        </div>
      ) : null}

      <p className="mt-6 text-[11px] leading-relaxed text-zinc-400 dark:text-white/30">
        After Meta approval you return here automatically. Reconnect anytime
        tokens expire. More networks later — Instagram is the live channel this
        week.
      </p>
    </div>
  )
}

export function ConnectionsContent() {
  const [oauthNotice, setOauthNotice] = useState<OAuthNotice | null>(null)

  return (
    <>
      <Suspense fallback={null}>
        <OAuthReturnHandler onNotice={setOauthNotice} />
      </Suspense>
      <ConnectionsInner oauthNotice={oauthNotice} />
    </>
  )
}

export { ConnectionsSkeleton }
