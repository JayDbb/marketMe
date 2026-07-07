'use client'

/**
 * Dashboard auth client — sign-in, sign-up, sign-out (login/signup UI).
 * For marketing session checks only, use `@/lib/auth-session` instead.
 * Always import from `better-auth/client`, not `better-auth/react`.
 */
import { createAuthClient } from 'better-auth/client'
import { dashClient } from '@better-auth/infra/client'

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  plugins: [dashClient() as never],
})

export const { signIn, signUp, signOut } = authClient
