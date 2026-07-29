'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
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

const SocialConnectionsContext =
  createContext<SocialConnectionsContextValue | null>(null)

export function SocialConnectionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectingPlatform, setConnectingPlatform] =
    useState<SocialPlatform | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<RefreshConnectionsResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchConnections()
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
  }, [])

  useEffect(() => {
    startTransition(() => {
      void refresh()
    })
  }, [refresh])

  const connect = useCallback(async (platform: SocialPlatform) => {
    setConnectingPlatform(platform)
    setError(null)
    try {
      await initiatePlatformConnect(platform)
      // Browser navigates away to Meta; no local state update needed.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Connection failed'
      setError(message)
      toast.error(message)
      setConnectingPlatform(null)
    }
  }, [])

  const disconnect = useCallback(async (connectionId: string) => {
    setError(null)
    try {
      await disconnectConnection(connectionId)
      setConnections((prev) => prev.filter((c) => c.id !== connectionId))
      toast.message('Removed from this view', {
        description:
          'Revoke access in Meta Business settings to fully disconnect the publish service.',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disconnect failed')
    }
  }, [])

  const getConnection = useCallback(
    (platform: SocialPlatform) =>
      connections.find((c) => c.platform === platform && c.status === 'connected'),
    [connections]
  )

  const isConnected = useCallback(
    (platform: SocialPlatform) => !!getConnection(platform),
    [getConnection]
  )

  const value = useMemo(
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
      hasInstagram: isConnected('instagram'),
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
    ]
  )

  return (
    <SocialConnectionsContext.Provider value={value}>
      {children}
    </SocialConnectionsContext.Provider>
  )
}

export function useSocialConnections() {
  const ctx = useContext(SocialConnectionsContext)
  if (!ctx) {
    throw new Error(
      'useSocialConnections must be used within SocialConnectionsProvider'
    )
  }
  return ctx
}
