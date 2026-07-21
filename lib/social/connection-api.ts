/**
 * Social connections — localStorage stub until real OAuth is wired.
 */

import type { SocialConnection, SocialPlatform } from '@/types/social'

const STORAGE_KEY = 'marketme_social_connections'

function readStored(): SocialConnection[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SocialConnection[]
  } catch {
    return []
  }
}

function writeStored(connections: SocialConnection[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections))
}

export async function fetchConnections(): Promise<SocialConnection[]> {
  await delay(200)
  return readStored()
}

export async function initiatePlatformConnect(
  platform: SocialPlatform
): Promise<SocialConnection> {
  await delay(1200)

  const connection: SocialConnection = {
    id: `${platform}-${Date.now()}`,
    platform,
    handle: platform === 'instagram' ? 'mybrand' : platform,
    displayName: platform === 'instagram' ? 'My Brand' : platform,
    status: 'connected',
    connectedAt: new Date().toISOString(),
  }

  const existing = readStored().filter((c) => c.platform !== platform)
  writeStored([...existing, connection])
  return connection
}

export async function disconnectConnection(connectionId: string): Promise<void> {
  await delay(200)
  writeStored(readStored().filter((c) => c.id !== connectionId))
}

export async function saveConnectionFromOAuth(
  connection: SocialConnection
): Promise<SocialConnection> {
  const existing = readStored().filter((c) => c.platform !== connection.platform)
  writeStored([...existing, connection])
  return connection
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
