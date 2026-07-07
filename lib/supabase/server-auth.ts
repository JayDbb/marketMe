import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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

/** Resolve the authenticated user via Better Auth. */
export async function getAuthenticatedUser(): Promise<(AuthUser & { id: string }) | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
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
  } catch {
    return null
  }
}

/** Skip PostgREST uuid filters when the id cannot be cast server-side. */
export function canQueryByUserId(userId: string): boolean {
  return isValidUuid(userId)
}
