'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import type { SocialConnection, SocialPlatform } from '@/types/social'
import {
  disconnectConnection,
  fetchConnections,
  initiatePlatformConnect,
  confirmInstagramOAuth,
} from '@/lib/social/connection-api'

export type RefreshConnectionsResult =
<<<<<<< HEAD
  | { ok: true; warning?: string }
=======
  | { ok: true; warning?: string; source?: string }
>>>>>>> origin/development
  | { ok: false; error: string }

interface SocialConnectionsContextValue {
  connections: SocialConnection[]
  isLoading: boolean
  connectingPlatform: SocialPlatform | null
  error: string | null
  warning: string | null
<<<<<<< HEAD
  refresh: () => Promise<RefreshConnectionsResult>
  confirmOAuthSuccess: (platform?: SocialPlatform) => Promise<RefreshConnectionsResult>
=======
  source: string | null
  refresh: () => Promise<RefreshConnectionsResult>
  confirmOAuthSuccess: (
    platform?: SocialPlatform,
    handle?: string
  ) => Promise<RefreshConnectionsResult>
>>>>>>> origin/development
  connect: (platform: SocialPlatform) => Promise<void>
  disconnect: (connectionId: string) => Promise<void>
  getConnection: (platform: SocialPlatform) => SocialConnection | undefined
  isConnected: (platform: SocialPlatform) => boolean
  hasInstagram: boolean
}

interface SocialConnectionsProviderProps {
  children: ReactNode

  /**
   * UUID from public.business_profiles.id.
   *
   * Example:
   * 2e39d9f0-ccac-4b7e-88df-e186e580d717
   */
  businessProfileId: string
}

const SocialConnectionsContext =
  createContext<SocialConnectionsContextValue | null>(null)

export function SocialConnectionsProvider({
  children,
  businessProfileId,
}: SocialConnectionsProviderProps) {
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectingPlatform, setConnectingPlatform] =
    useState<SocialPlatform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
<<<<<<< HEAD
=======
  const [source, setSource] = useState<string | null>(null)
>>>>>>> origin/development

  const refresh = useCallback(async (): Promise<RefreshConnectionsResult> => {
    const normalizedProfileId = businessProfileId.trim()

    if (!normalizedProfileId) {
      setConnections([])
      setError('No business profile is available.')
      setWarning(null)
<<<<<<< HEAD
=======
      setSource(null)
>>>>>>> origin/development
      setIsLoading(false)
      return { ok: false, error: 'No business profile is available.' }
    }

    setIsLoading(true)
    setError(null)
    setWarning(null)

    try {
      const result = await fetchConnections(normalizedProfileId)
      if (!result.ok) {
        // Keep any previously shown connections if the list fails hard
        if (result.connections?.length) {
          setConnections(result.connections)
        }
        setError(result.error)
        return { ok: false, error: result.error }
      }
      setConnections(result.connections)
<<<<<<< HEAD
      if (result.warning) setWarning(result.warning)
      return { ok: true, warning: result.warning }
=======
      setSource(result.source ?? null)
      if (result.warning) setWarning(result.warning)
      return { ok: true, warning: result.warning, source: result.source }
>>>>>>> origin/development
    } finally {
      setIsLoading(false)
    }
  }, [businessProfileId])

  const confirmOAuthSuccess = useCallback(
<<<<<<< HEAD
    async (platform: SocialPlatform = 'instagram'): Promise<RefreshConnectionsResult> => {
=======
    async (
      platform: SocialPlatform = 'instagram',
      handle?: string
    ): Promise<RefreshConnectionsResult> => {
>>>>>>> origin/development
      if (platform !== 'instagram') {
        return { ok: false, error: 'Only Instagram OAuth confirm is supported' }
      }
      setIsLoading(true)
      setError(null)
      try {
<<<<<<< HEAD
        const saved = await confirmInstagramOAuth()
        if (saved.ok && saved.connections.length > 0) {
          setConnections(saved.connections)
=======
        const saved = await confirmInstagramOAuth(handle)
        if (saved.ok && saved.connections.length > 0) {
          setConnections(saved.connections)
          setSource(saved.source ?? 'mirror')
>>>>>>> origin/development
        }
        const refreshed = await fetchConnections(businessProfileId.trim())
        if (refreshed.ok) {
          setConnections(refreshed.connections)
<<<<<<< HEAD
          if (refreshed.warning) setWarning(refreshed.warning)
          return { ok: true, warning: refreshed.warning }
=======
          setSource(
            refreshed.source ?? (saved.ok ? saved.source : undefined) ?? 'mirror'
          )
          if (refreshed.warning) setWarning(refreshed.warning)
          return { ok: true, warning: refreshed.warning, source: refreshed.source }
>>>>>>> origin/development
        }
        if (saved.ok) {
          if (refreshed.error) setWarning(refreshed.error)
          return { ok: true, warning: refreshed.error }
        }
        setError(saved.error)
        return { ok: false, error: saved.error }
      } finally {
        setIsLoading(false)
        setConnectingPlatform(null)
      }
    },
    [businessProfileId]
  )

  useEffect(() => {
    startTransition(() => {
      void refresh()
    })
  }, [refresh])

  const connect = useCallback(
    async (platform: SocialPlatform) => {
      const normalizedProfileId = businessProfileId.trim()

      if (!normalizedProfileId) {
        setError('A business profile is required before connecting an account.')
        return
      }

      setConnectingPlatform(platform)
      setError(null)
      try {
        await initiatePlatformConnect(platform, normalizedProfileId)
        // Browser navigates away to Meta; no local state update needed.
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Connection failed'
        setError(message)
<<<<<<< HEAD
        toast.error(message)
=======
>>>>>>> origin/development
        setConnectingPlatform(null)
      }
    },
    [businessProfileId]
  )

  const disconnect = useCallback(
    async (connectionId: string) => {
      const normalizedProfileId = businessProfileId.trim()

      if (!normalizedProfileId) {
        setError('A business profile is required.')
        return
      }

      setError(null)
      try {
        await disconnectConnection(connectionId, normalizedProfileId)
        setConnections((prev) => prev.filter((c) => c.id !== connectionId))
<<<<<<< HEAD
        toast.success('Instagram disconnected in MarketMe')
=======
        setSource(null)
        setWarning(null)
        toast.success('Instagram removed from MarketMe', {
          description:
            'Revoke MarketMe in Meta Business Integrations if you want to cut token access.',
        })
>>>>>>> origin/development
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Disconnect failed')
      }
    },
    [businessProfileId]
  )

  const getConnection = useCallback(
    (platform: SocialPlatform) =>
<<<<<<< HEAD
      connections.find((c) => c.platform === platform && c.status === 'connected'),
=======
      connections.find(
        (c) => c.platform === platform && c.status !== 'disconnected'
      ),
>>>>>>> origin/development
    [connections]
  )

  const isConnected = useCallback(
    (platform: SocialPlatform) => !!getConnection(platform),
    [getConnection]
  )

  const hasInstagram = isConnected('instagram')

  const value = useMemo<SocialConnectionsContextValue>(
    () => ({
      connections,
      isLoading,
      connectingPlatform,
      error,
      warning,
<<<<<<< HEAD
=======
      source,
>>>>>>> origin/development
      refresh,
      confirmOAuthSuccess,
      connect,
      disconnect,
      getConnection,
      isConnected,
      hasInstagram,
    }),
    [
      connections,
      isLoading,
      connectingPlatform,
      error,
      warning,
<<<<<<< HEAD
=======
      source,
>>>>>>> origin/development
      refresh,
      confirmOAuthSuccess,
      connect,
      disconnect,
      getConnection,
      isConnected,
      hasInstagram,
    ]
  )

  return (
    <SocialConnectionsContext.Provider value={value}>
      {children}
    </SocialConnectionsContext.Provider>
  )
}

export function useSocialConnections(): SocialConnectionsContextValue {
  const context = useContext(SocialConnectionsContext)
  if (!context) {
    throw new Error(
      'useSocialConnections must be used within SocialConnectionsProvider.'
    )
  }
  return context
}
