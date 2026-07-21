import { cache } from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Get the current Better Auth session from request headers.
 * Cached once per request so layout + pages share a single lookup.
 */
export const getSession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session
  } catch {
    return null
  }
})

/**
 * Require authentication. Returns the session or throws a structured error.
 * For use in API Route Handlers.
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new AuthError('Not authenticated', 401)
  }
  return session
}

/**
 * Get the authenticated user ID, or null if not authenticated.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id ?? null
}

/**
 * Structured auth error for API responses.
 */
export class AuthError extends Error {
  status: number
  constructor(message: string, status: number = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}
