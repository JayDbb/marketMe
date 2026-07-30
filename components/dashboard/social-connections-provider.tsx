"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type {
  SocialConnection,
  SocialPlatform,
} from "@/types/social"

import {
  disconnectConnection,
  fetchConnections,
  initiatePlatformConnect,
} from "@/lib/social/connection-api"


interface SocialConnectionsContextValue {
  connections: SocialConnection[]
  isLoading: boolean
  connectingPlatform: SocialPlatform | null
  error: string | null

  refresh: () => Promise<void>

  connect: (
    platform: SocialPlatform
  ) => Promise<void>

  disconnect: (
    connectionId: string
  ) => Promise<void>

  getConnection: (
    platform: SocialPlatform
  ) => SocialConnection | undefined

  isConnected: (
    platform: SocialPlatform
  ) => boolean

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
  createContext<SocialConnectionsContextValue | null>(
    null
  )


export function SocialConnectionsProvider({
  children,
  businessProfileId,
}: SocialConnectionsProviderProps) {
  const [connections, setConnections] =
    useState<SocialConnection[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    connectingPlatform,
    setConnectingPlatform,
  ] = useState<SocialPlatform | null>(null)

  const [error, setError] =
    useState<string | null>(null)


  const refresh = useCallback(async (): Promise<void> => {
    const normalizedProfileId =
      businessProfileId.trim()

    if (!normalizedProfileId) {
      setConnections([])
      setError(
        "No business profile is available."
      )
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchConnections(
        normalizedProfileId
      )

      setConnections(data)
    } catch (caughtError) {
      setConnections([])

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load connections."
      )
    } finally {
      setIsLoading(false)
    }
  }, [businessProfileId])


  useEffect(() => {
    void refresh()
  }, [refresh])


  const connect = useCallback(
    async (
      platform: SocialPlatform
    ): Promise<void> => {
      const normalizedProfileId =
        businessProfileId.trim()

      if (!normalizedProfileId) {
        setError(
          "A business profile is required before connecting an account."
        )
        return
      }

      setConnectingPlatform(platform)
      setError(null)

      try {
        const connection =
          await initiatePlatformConnect(
            platform,
            normalizedProfileId
          )

        /*
         * Instagram normally redirects the browser immediately.
         * This temporary connection is primarily useful for platforms
         * that do not redirect.
         */
        setConnections((previous) => {
          const remaining =
            previous.filter(
              (item) =>
                item.platform !== platform
            )

          return [
            ...remaining,
            connection,
          ]
        })
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Connection failed."
        )
      } finally {
        setConnectingPlatform(null)
      }
    },
    [businessProfileId]
  )


  const disconnect = useCallback(
    async (
      connectionId: string
    ): Promise<void> => {
      const normalizedProfileId =
        businessProfileId.trim()

      if (!normalizedProfileId) {
        setError(
          "A business profile is required."
        )
        return
      }

      setError(null)

      try {
        await disconnectConnection(
          connectionId,
          normalizedProfileId
        )

        setConnections((previous) =>
          previous.filter(
            (connection) =>
              connection.id !== connectionId
          )
        )
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Disconnect failed."
        )
      }
    },
    [businessProfileId]
  )


  const getConnection = useCallback(
    (
      platform: SocialPlatform
    ): SocialConnection | undefined => {
      return connections.find(
        (connection) =>
          connection.platform === platform &&
          connection.status === "connected"
      )
    },
    [connections]
  )


  const isConnected = useCallback(
    (
      platform: SocialPlatform
    ): boolean => {
      return Boolean(
        getConnection(platform)
      )
    },
    [getConnection]
  )


  const hasInstagram =
    isConnected("instagram")


  const value =
    useMemo<SocialConnectionsContextValue>(
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
    <SocialConnectionsContext.Provider
      value={value}
    >
      {children}
    </SocialConnectionsContext.Provider>
  )
}


export function useSocialConnections():
  SocialConnectionsContextValue {
  const context = useContext(
    SocialConnectionsContext
  )

  if (!context) {
    throw new Error(
      "useSocialConnections must be used within " +
      "SocialConnectionsProvider."
    )
  }

  return context
}