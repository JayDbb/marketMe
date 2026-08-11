'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AtSign,
  CheckCircle2,
  ExternalLink,
  Info,
  Link2,
  Loader2,
  RefreshCw,
  Unplug,
} from 'lucide-react'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'
import { SOCIAL_PLATFORMS } from '@/lib/social/platforms'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import { getInstagramAccountLabel } from '@/lib/social/instagram-account'
import {
  consumeInstagramOAuthPending,
  parseOAuthReturnParams,
  stripOAuthReturnParams,
} from '@/lib/social/oauth'
import type { SocialConnection, SocialPlatform } from '@/types/social'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 22 },
  },
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

function OAuthReturnHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { refresh, confirmOAuthSuccess } = useSocialConnections()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return

    const result = parseOAuthReturnParams(searchParams)
    // Consume pending so a later soft navigation can't false-confirm.
    const pending = consumeInstagramOAuthPending()
    if (result.kind === 'none' && !pending) return

    handled.current = true

    void (async () => {
      if (result.kind === 'error') {
        toast.error(result.message, {
          description:
            'Use an Instagram Business or Creator account linked to a Facebook Page, then try Connect again.',
          duration: 10_000,
        })
        // Keep any existing mirror; failed reconnect must not invent a new connection.
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
            toast.message('Saved in MarketMe', {
              description: confirmed.warning,
            })
          }
        } else {
          const refreshed = await refresh()
          if (refreshed.ok) {
            toast.success('Instagram authorized')
          } else {
            toast.error(confirmed.error || refreshed.error)
          }
        }
      } else if (pending) {
        // Landed without oauth query (misdirected or cancelled mid-flow).
        // Never upsert a placeholder "connected" row from pending alone.
        await refresh()
        toast.message('Instagram connection was not completed', {
          description: 'No OAuth result was returned. Try Connect again.',
        })
      }

      if (result.kind !== 'none') {
        router.replace(`${pathname}${stripOAuthReturnParams(searchParams)}`)
      }
    })()
  }, [searchParams, refresh, confirmOAuthSuccess, router, pathname])

  return null
}

function ConnectedInstagramCard({
  connection,
  onDisconnect,
  onReconnect,
  reconnecting,
}: {
  connection: SocialConnection
  onDisconnect: () => void
  onReconnect: () => void
  reconnecting: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const account = getInstagramAccountLabel(connection)

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-white dark:bg-[#0f1117] shadow-xl"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-500/8 via-transparent to-sky-500/5"
        aria-hidden
      />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <InstagramGlyph className="size-7" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-[#0f1117]">
                <CheckCircle2 className="size-3 text-white" strokeWidth={2.5} />
              </span>
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Connected
                </span>
                <span className="text-xs text-zinc-500 dark:text-white/40">Instagram</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                {account.title}
              </h2>

              <p className="text-sm text-zinc-500 dark:text-white/45">{account.subtitle}</p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 dark:text-white/35">
                {connection.connectedAt ? (
                  <span>Linked {formatDistanceToNow(connection.connectedAt)} ago</span>
                ) : null}
                {account.profileUrl ? (
                  <a
                    href={account.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    View on Instagram
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            {!confirming ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-zinc-200 dark:border-white/12"
                  disabled={reconnecting}
                  onClick={onReconnect}
                >
                  {reconnecting ? (
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
              <div className="w-full max-w-xs rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-500/10 sm:w-64">
                <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
                  Disconnect {account.atHandle ?? 'this Instagram account'} from MarketMe?
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
                    Disconnect
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 flex-1 rounded-lg text-xs"
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
    </motion.div>
  )
}

function EmptyInstagramCard({
  onConnect,
  connecting,
}: {
  onConnect: () => void
  connecting: boolean
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white dark:border-white/12 dark:bg-[#0f1117]"
    >
      <div className="relative z-10 flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
            <InstagramGlyph className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              Connect Instagram
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-zinc-500 dark:text-white/45">
              Link an Instagram Business or Creator account that is already tied to a Facebook
              Page. Personal profiles and Facebook-only logins will fail Meta’s check.
            </p>
          </div>
        </div>

        <Button
          type="button"
          className="h-11 shrink-0 rounded-xl px-5 font-semibold"
          disabled={connecting}
          onClick={onConnect}
        >
          {connecting ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <AtSign className="mr-2 size-4" />
          )}
          Connect Instagram
        </Button>
      </div>
    </motion.div>
  )
}

export function ConnectionsContent() {
  const {
    connections,
    isLoading,
    connectingPlatform,
    error,
    warning,
    connect,
    disconnect,
    isConnected,
    hasInstagram,
    refresh,
    getConnection,
  } = useSocialConnections()

  const instagram = getConnection('instagram')
  const account = instagram ? getInstagramAccountLabel(instagram) : null

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative z-10 mx-auto max-w-3xl px-6 py-10"
    >
      <Suspense fallback={null}>
        <OAuthReturnHandler />
      </Suspense>

      <motion.div variants={itemVariants} className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-sky-600 dark:text-sky-400/80">
          Social
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
          Connections
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-white/45">
          {hasInstagram && account?.atHandle
            ? `Publishing as ${account.atHandle} on Instagram.`
            : hasInstagram
              ? 'Instagram is linked to this workspace.'
              : 'Connect Instagram to publish posts and unlock scheduling.'}
        </p>
      </motion.div>

      {(error || warning) && (
        <motion.div
          variants={itemVariants}
          role="status"
          className={`mb-6 flex gap-3 rounded-xl border px-4 py-3 ${
            error && !hasInstagram
              ? 'border-amber-500/25 bg-amber-500/8'
              : warning
                ? 'border-amber-500/25 bg-amber-500/8'
                : 'border-sky-500/25 bg-sky-500/8'
          }`}
        >
          <Info
            className={`mt-0.5 size-5 shrink-0 ${
              error || warning ? 'text-amber-500' : 'text-sky-500'
            }`}
          />
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {error && !hasInstagram
                ? 'Could not verify Instagram with the publish service'
                : warning
                  ? 'Instagram is saved — publish sync needs attention'
                  : 'Heads up'}
            </p>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-white/45">
              {error && !hasInstagram ? error : warning}
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
        </motion.div>
      )}

      {isLoading ? (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white py-20 text-zinc-500 dark:border-white/10 dark:bg-[#0f1117] dark:text-white/40"
        >
          <Loader2 className="mr-2 size-5 animate-spin" />
          Loading Instagram…
        </motion.div>
      ) : hasInstagram && instagram ? (
        <ConnectedInstagramCard
          connection={instagram}
          reconnecting={connectingPlatform === 'instagram'}
          onReconnect={() => void connect('instagram')}
          onDisconnect={() => void disconnect(instagram.id)}
        />
      ) : (
        <EmptyInstagramCard
          connecting={connectingPlatform === 'instagram'}
          onConnect={() => void connect('instagram')}
        />
      )}

      <motion.div variants={itemVariants} className="mt-10">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-white/35">
          Platforms
        </h3>
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-white/8 dark:border-white/10 dark:bg-[#0f1117]">
          {SOCIAL_PLATFORMS.map((platform) => {
            const connectedPlatform = isConnected(platform.id)
            const isConnecting = connectingPlatform === platform.id
            const igLabel =
              platform.id === 'instagram' && connectedPlatform && account
                ? account.atHandle
                : null

            return (
              <li
                key={platform.id}
                className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${
                      connectedPlatform
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45'
                    }`}
                  >
                    {platform.id === 'instagram' ? (
                      <InstagramGlyph className="size-4" />
                    ) : (
                      <Link2 className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {platform.label}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-white/40">
                      {igLabel
                        ? `Connected as ${igLabel}`
                        : connectedPlatform
                          ? 'Connected'
                          : platform.available
                            ? 'Not connected'
                            : 'Coming soon'}
                    </p>
                  </div>
                </div>

                {platform.available ? (
                  <Button
                    type="button"
                    size="sm"
                    variant={connectedPlatform ? 'secondary' : 'default'}
                    className="h-9 shrink-0 rounded-lg"
                    disabled={isConnecting}
                    onClick={() => void connect(platform.id as SocialPlatform)}
                  >
                    {isConnecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : connectedPlatform ? (
                      'Reconnect'
                    ) : (
                      'Connect'
                    )}
                  </Button>
                ) : (
                  <span className="shrink-0 rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-400 dark:border-white/10 dark:text-white/30">
                    Soon
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-400 dark:text-white/30">
          After Meta approval you return here automatically. Reconnect anytime if tokens expire.
        </p>
      </motion.div>
    </motion.div>
  )
}
