'use client'

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AtSign, CheckCircle2, Link2, Loader2, Unplug, Info } from 'lucide-react'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'
import { SOCIAL_PLATFORMS } from '@/lib/social/platforms'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import {
  consumeInstagramOAuthPending,
  parseOAuthReturnParams,
  stripOAuthReturnParams,
} from '@/lib/social/oauth'
import type { SocialPlatform } from '@/types/social'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
}

function platformInitial(platform: SocialPlatform): string {
  return platform.charAt(0).toUpperCase()
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
    const pending = consumeInstagramOAuthPending()
    if (result.kind === 'none' && !pending) return

    handled.current = true

    void (async () => {
      if (result.kind === 'error') {
        toast.error(result.message)
      } else {
        // Save in MarketMe first so the Connections page shows Instagram even if
        // the publish API list endpoint is still broken (SecretStr / DB).
        const confirmed = await confirmOAuthSuccess('instagram')
        if (confirmed.ok) {
          toast.success(
            result.kind === 'success' && result.message
              ? result.message
              : 'Instagram connected to MarketMe'
          )
          if (confirmed.warning) {
            toast.message('Saved in MarketMe', {
              description: confirmed.warning,
            })
          }
        } else {
          const refreshed = await refresh()
          if (refreshed.ok) {
            toast.success('Instagram authorized with Meta')
          } else {
            toast.error(confirmed.error || refreshed.error)
          }
        }
      }

      if (result.kind !== 'none') {
        router.replace(`${pathname}${stripOAuthReturnParams(searchParams)}`)
      }
    })()
  }, [searchParams, refresh, confirmOAuthSuccess, router, pathname])

  return null
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
  } = useSocialConnections()

  const connected = connections.filter((c) => c.status === 'connected')
  const bannerTone = error ? 'error' : warning ? 'warning' : hasInstagram ? 'success' : 'info'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-10 relative z-10"
    >
      <Suspense fallback={null}>
        <OAuthReturnHandler />
      </Suspense>

      <div
        className={`mb-6 rounded-xl border px-4 py-3 flex gap-3 ${
          bannerTone === 'error'
            ? 'border-amber-500/25 bg-amber-500/8'
            : bannerTone === 'warning'
              ? 'border-amber-500/25 bg-amber-500/8'
              : bannerTone === 'success'
                ? 'border-emerald-500/25 bg-emerald-500/8'
                : 'border-blue-500/25 bg-blue-500/8'
        }`}
      >
        <Info
          className={`w-5 h-5 shrink-0 mt-0.5 ${
            bannerTone === 'error' || bannerTone === 'warning'
              ? 'text-amber-500'
              : bannerTone === 'success'
                ? 'text-emerald-500'
                : 'text-blue-500'
          }`}
        />
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {error && !hasInstagram
              ? 'Meta may be connected, but MarketMe cannot load it yet'
              : hasInstagram
                ? 'Instagram is connected to MarketMe'
                : 'Connect Instagram with Meta OAuth'}
          </p>
          <p className="text-xs text-zinc-500 dark:text-white/45 mt-0.5 leading-relaxed">
            {error && !hasInstagram
              ? error
              : warning
                ? warning
                : hasInstagram
                  ? 'Shown from your MarketMe account. Publish tokens live on the MarketMe AI service — reconnect if publishing fails.'
                  : 'Connect opens Meta Login for Instagram Business / Creator accounts linked to a Facebook Page. After Meta succeeds, MarketMe saves the connection so it shows here.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <motion.div
          variants={itemVariants}
          className="flex-1 w-full bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-xl border dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-white/50 tracking-wider uppercase">
              Connected profiles
            </h2>
            <p className="text-xs text-zinc-400 dark:text-white/30">
              Saved in MarketMe
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 relative z-10 space-y-2"
            >
              <p className="font-medium">Could not load Instagram connection</p>
              <p className="text-xs leading-relaxed opacity-90">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => void refresh()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500 dark:text-white/40 relative z-10">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading connections…
            </div>
          ) : connected.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 p-10 text-center relative z-10">
              <AtSign className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-white/20" />
              <p className="text-sm text-zinc-500 dark:text-white/50">
                No Instagram account connected yet. Use Connect on the right to authorize Meta.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
              {connected.map((conn) => (
                <Card
                  key={conn.id}
                  className="bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 shadow-none rounded-xl"
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#0c0c18] font-bold flex items-center justify-center text-lg shadow-inner relative">
                        {platformInitial(conn.platform)}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0c0c18]" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-zinc-500 hover:text-red-600"
                        onClick={() => void disconnect(conn.id)}
                      >
                        <Unplug className="w-3.5 h-3.5 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
                        @{conn.handle.replace(/^@/, '')}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-white/40 mt-0.5 truncate">
                        {conn.displayName}
                      </p>
                      {conn.connectedAt ? (
                        <p className="text-[10px] text-zinc-400 dark:text-white/30 mt-1">
                          Connected {formatDistanceToNow(conn.connectedAt)} ago
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="w-full lg:w-[400px] shrink-0 pt-4 lg:pt-10 px-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Connect your social profiles
          </h2>
          <p className="text-sm text-zinc-500 dark:text-white/40 mb-6 leading-relaxed">
            Link Instagram to unlock inbox and publishing workflows. Other platforms are coming soon.
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3 text-sm text-zinc-500 dark:text-white/70">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span>Schedule posts from the planner and generate flows</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-500 dark:text-white/70">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span>Publish through Instagram Graph API</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-500 dark:text-white/70">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span>Reconnect anytime if Meta tokens expire</span>
            </li>
          </ul>

          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map((platform) => {
              const connectedPlatform = isConnected(platform.id)
              const isConnecting = connectingPlatform === platform.id

              return (
                <Button
                  key={platform.id}
                  type="button"
                  disabled={!platform.available || isConnecting}
                  onClick={() => void connect(platform.id)}
                  className="h-11 w-full justify-between rounded-xl font-bold border-0"
                  variant={connectedPlatform ? 'secondary' : 'default'}
                >
                  <span className="inline-flex items-center gap-2">
                    {platform.id === 'instagram' ? (
                      <AtSign className="w-4 h-4" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                    {platform.label}
                  </span>
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : connectedPlatform ? (
                    <span className="text-xs font-medium text-green-600">
                      {platform.available ? 'Reconnect' : 'Connected'}
                    </span>
                  ) : !platform.available ? (
                    <span className="text-xs font-medium opacity-60">Soon</span>
                  ) : (
                    <span className="text-xs font-medium">Connect</span>
                  )}
                </Button>
              )
            })}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-zinc-400 dark:text-white/30">
            Requires an Instagram Business or Creator account linked to a Facebook Page. After Meta
            approval, you&apos;ll return here automatically.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
