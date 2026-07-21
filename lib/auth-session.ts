'use client'

/**
 * Marketing-only auth client — navbar session check via `sessionClient.getSession()`.
 * Do not use for sign-in flows; use `@/lib/auth-client` on login/signup pages.
 */
import { createAuthClient } from 'better-auth/client'

export const sessionClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
})
