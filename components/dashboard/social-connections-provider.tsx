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
import type { SocialConnection, SocialPlatform } from '@/types/social'
import {
  disconnectConnection,
  fetchConnections,
  initiatePlatformConnect,
} from '@/lib/social/connection-api'

interface SocialConnectionsContextValue {
  connections: SocialConnection[]
  isLoading: boolean
  connectingPlatform: SocialPlatform | null
  error: string | null
  refresh: () => Promise<void>
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

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchConnections()
      setConnections(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load connections')
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
      const connection = await initiatePlatformConnect(platform)
      setConnections((prev) => {
        const rest = prev.filter((c) => c.platform !== platform)
        return [...rest, connection]
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setConnectingPlatform(null)
    }
  }, [])

  const disconnect = useCallback(async (connectionId: string) => {
    setError(null)
    try {
      await disconnectConnection(connectionId)
      setConnections((prev) => prev.filter((c) => c.id !== connectionId))
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
