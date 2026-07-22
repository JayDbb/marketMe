/**
 * Social connections — Real Meta OAuth integration with backend API & Supabase.
 */

import type { SocialConnection, SocialPlatform } from '@/types/social'
import { getPublishAuthUrl, getSocialConnections } from '@/lib/services/marketing-ai.service'

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

export async function fetchConnections(businessId: string = '1'): Promise<SocialConnection[]> {
  try {
    const rawAccounts = await getSocialConnections(businessId)
    if (Array.isArray(rawAccounts) && rawAccounts.length > 0) {
      const apiConnections: SocialConnection[] = rawAccounts.map((acc) => ({
        id: String(acc.id || acc.instagram_user_id || acc.platform),
        platform: (acc.platform || 'instagram') as SocialPlatform,
        handle: acc.handle || 'connected_account',
        displayName: acc.handle || 'Connected Account',
        status: acc.connected_status === 'connected' ? 'connected' : 'disconnected',
        connectedAt: acc.created_at || new Date().toISOString(),
      }))

      // Sync with localStorage cache
      writeStored(apiConnections)
      return apiConnections
    }
  } catch (error) {
    console.warn('Failed to fetch connections from backend API, falling back to local storage:', error)
  }

  return readStored()
}

export async function initiatePlatformConnect(
  platform: SocialPlatform,
  businessId: string = '1'
): Promise<SocialConnection> {
  if (platform === 'instagram') {
    const authUrl = await getPublishAuthUrl(businessId)
    if (typeof window !== 'undefined' && authUrl) {
      window.location.href = authUrl
    }
    // Return temporary pending state while redirecting
    return {
      id: `${platform}-pending`,
      platform,
      handle: 'connecting...',
      displayName: 'Connecting Instagram...',
      status: 'disconnected',
    }
  }

  // Fallback stub for unsupported platforms
  await delay(600)
  const connection: SocialConnection = {
    id: `${platform}-${Date.now()}`,
    platform,
    handle: platform,
    displayName: platform,
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
