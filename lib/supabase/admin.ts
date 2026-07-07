import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env'

// This client uses the service role key, meaning it BYPASSES Row Level Security (RLS).
// IT MUST NEVER BE USED ON THE CLIENT SIDE OR EXPOSED TO USERS.

let adminClient: SupabaseClient | undefined

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      requireEnv(
        'NEXT_PUBLIC_SUPABASE_URL',
        'Add it to .env.local (see .env.example).'
      ),
      requireEnv(
        'SUPABASE_SERVICE_ROLE_KEY',
        'Add it to .env.local (see .env.example).'
      )
    )
  }
  return adminClient
}

/** @deprecated Prefer getSupabaseAdmin() — lazy init avoids crashes when env is missing at import time. */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
