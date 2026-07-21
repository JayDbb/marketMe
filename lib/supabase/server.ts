import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireEnv } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    requireEnv(
      'NEXT_PUBLIC_SUPABASE_URL',
      'Add it to .env.local (see .env.example).'
    ),
    requireEnv(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'Add it to .env.local (see .env.example).'
    ),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore when middleware handles refresh.
          }
        },
      },
    }
  )
}
