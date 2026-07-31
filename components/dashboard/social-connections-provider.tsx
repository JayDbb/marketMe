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
} from '@/lib/social/connection-api'

export type RefreshConnectionsResult =
  | { ok: true }
  | { ok: false; error: string }

interface SocialConnectionsContextValue {
  connections: SocialConnection[]
  isLoading: boolean
  connectingPlatform: SocialPlatform | null
  error: string | null
  refresh: () => Promise<RefreshConnectionsResult>
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

  const refresh = useCallback(async (): Promise<RefreshConnectionsResult> => {
    const normalizedProfileId = businessProfileId.trim()

    if (!normalizedProfileId) {
      setConnections([])
      setError('No business profile is available.')
      setIsLoading(false)
      return { ok: false, error: 'No business profile is available.' }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchConnections(normalizedProfileId)
      if (!result.ok) {
        setConnections([])
        setError(result.error)
        return { ok: false, error: result.error }
      }
      setConnections(result.connections)
      return { ok: true }
    } finally {
      setIsLoading(false)
    }
  }, [businessProfileId])

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
        toast.error(message)
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
        toast.message('Removed from this view', {
          description:
            'Revoke access in Meta Business settings to fully disconnect the publish service.',
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Disconnect failed')
      }
    },
    [businessProfileId]
  )

  const getConnection = useCallback(
    (platform: SocialPlatform) =>
      connections.find((c) => c.platform === platform && c.status === 'connected'),
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
      refresh,
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
      refresh,
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
