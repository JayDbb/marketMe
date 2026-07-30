/**
 * Social connections — Meta OAuth integration with the FastAPI backend
 * and Supabase.
 */

import type {
  SocialConnection,
  SocialPlatform,
} from "@/types/social"

import {
  getPublishAuthUrl,
  getSocialConnections,
} from "@/lib/services/marketing-ai.service"


const STORAGE_KEY_PREFIX =
  "marketme_social_connections"


function normalizeBusinessProfileId(
  businessProfileId: string
): string {
  const normalized = businessProfileId.trim()

  if (!normalized) {
    throw new Error(
      "A business profile ID is required."
    )
  }

  return normalized
}


function getStorageKey(
  businessProfileId: string
): string {
  return (
    `${STORAGE_KEY_PREFIX}:` +
    normalizeBusinessProfileId(
      businessProfileId
    )
  )
}


function readStored(
  businessProfileId: string
): SocialConnection[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(
      getStorageKey(businessProfileId)
    )

    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    return Array.isArray(parsed)
      ? (parsed as SocialConnection[])
      : []
  } catch {
    return []
  }
}


function writeStored(
  businessProfileId: string,
  connections: SocialConnection[]
): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    getStorageKey(businessProfileId),
    JSON.stringify(connections)
  )
}


function isConnectedStatus(
  value: string | boolean | undefined
): boolean {
  return (
    value === true ||
    value === "connected"
  )
}


/**
 * Fetch connected social accounts for one business profile.
 *
 * businessProfileId must be the UUID from:
 * public.business_profiles.id
 */
export async function fetchConnections(
  businessProfileId: string
): Promise<SocialConnection[]> {
  const normalizedProfileId =
    normalizeBusinessProfileId(
      businessProfileId
    )

  try {
    const rawAccounts =
      await getSocialConnections(
        normalizedProfileId
      )

    const apiConnections: SocialConnection[] =
      rawAccounts.map((account) => ({
        id: String(
          account.account_id ??
          account.id ??
          account.instagram_user_id ??
          account.platform
        ),

        platform: (
          account.platform || "instagram"
        ) as SocialPlatform,

        handle:
          account.handle ||
          "connected_account",

        displayName:
          account.handle ||
          "Connected Account",

        status: isConnectedStatus(
          account.connected_status
        )
          ? "connected"
          : "disconnected",

        connectedAt:
          account.created_at ||
          new Date().toISOString(),
      }))

    /*
     * The backend responded successfully, so its result is the
     * source of truth—even when it returns an empty array.
     */
    writeStored(
      normalizedProfileId,
      apiConnections
    )

    return apiConnections
  } catch (error) {
    console.warn(
      "Failed to fetch connections from backend API; " +
      "using the local cache instead:",
      error
    )

    return readStored(
      normalizedProfileId
    )
  }
}


/**
 * Start the OAuth connection process for a platform.
 *
 * For Instagram, the browser is redirected to the FastAPI
 * /api/v1/auth/meta/login endpoint.
 */
export async function initiatePlatformConnect(
  platform: SocialPlatform,
  businessProfileId: string
): Promise<SocialConnection> {
  const normalizedProfileId =
    normalizeBusinessProfileId(
      businessProfileId
    )

  if (platform === "instagram") {
    const authUrl =
      await getPublishAuthUrl(
        normalizedProfileId
      )

    if (
      typeof window === "undefined"
    ) {
      throw new Error(
        "Instagram OAuth must be started in the browser."
      )
    }

    window.location.assign(authUrl)

    /*
     * This value is only a temporary UI state. The browser normally
     * navigates away before it is used.
     */
    return {
      id: `${platform}-pending`,
      platform,
      handle: "connecting...",
      displayName:
        "Connecting Instagram...",
      status: "disconnected",
    }
  }

  /*
   * Temporary local fallback for platforms that do not yet have a
   * real backend OAuth implementation.
   */
  await delay(600)

  const connection: SocialConnection = {
    id: `${platform}-${Date.now()}`,
    platform,
    handle: platform,
    displayName: platform,
    status: "connected",
    connectedAt:
      new Date().toISOString(),
  }

  const existing = readStored(
    normalizedProfileId
  ).filter(
    (item) =>
      item.platform !== platform
  )

  writeStored(
    normalizedProfileId,
    [...existing, connection]
  )

  return connection
}


/**
 * Remove a connection from the local cache.
 *
 * This currently does not delete the record from Supabase. A backend
 * disconnect endpoint should eventually be called here.
 */
export async function disconnectConnection(
  connectionId: string,
  businessProfileId: string
): Promise<void> {
  const normalizedProfileId =
    normalizeBusinessProfileId(
      businessProfileId
    )

  await delay(200)

  const remainingConnections =
    readStored(
      normalizedProfileId
    ).filter(
      (connection) =>
        connection.id !== connectionId
    )

  writeStored(
    normalizedProfileId,
    remainingConnections
  )
}


/**
 * Store a connection returned after OAuth.
 *
 * The normal Instagram flow should reload connections from the
 * backend after the callback redirects to the frontend.
 */
export async function saveConnectionFromOAuth(
  connection: SocialConnection,
  businessProfileId: string
): Promise<SocialConnection> {
  const normalizedProfileId =
    normalizeBusinessProfileId(
      businessProfileId
    )

  const existing = readStored(
    normalizedProfileId
  ).filter(
    (item) =>
      item.platform !==
      connection.platform
  )

  writeStored(
    normalizedProfileId,
    [...existing, connection]
  )

  return connection
}


function delay(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(
      resolve,
      milliseconds
    )
  })
}