import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env'

let browserClient: SupabaseClient | undefined

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      requireEnv(
        'NEXT_PUBLIC_SUPABASE_URL',
        'Add it to .env.local (see .env.example).'
      ),
      requireEnv(
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'Add it to .env.local (see .env.example).'
      )
    )
  }
  return browserClient
}
