import { cache } from 'react'
import { getSession } from '@/lib/services/auth.service'

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value)
}

/** Minimal user shape compatible with existing dashboard code. */
export interface AuthUser {
  id: string
  email?: string | null
  user_metadata?: {
    full_name?: string
    name?: string
  }
}

/** Resolve the authenticated user via Better Auth (once per request). */
export const getAuthenticatedUser = cache(async (): Promise<(AuthUser & { id: string }) | null> => {
  const session = await getSession()
  if (!session?.user) return null

  const { user } = session
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.name ?? undefined,
      name: user.name ?? undefined,
    },
  }
})

/** Skip PostgREST uuid filters when the id cannot be cast server-side. */
export function canQueryByUserId(userId: string): boolean {
  return isValidUuid(userId)
}
