/** Shared env helpers — fail with clear messages instead of opaque runtime errors. */

export function getEnv(key: string): string | undefined {
  const value = process.env[key]?.trim()
  return value || undefined
}

export function requireEnv(key: string, hint?: string): string {
  const value = getEnv(key)
  if (!value) {
    const suffix = hint ? ` ${hint}` : ''
    throw new Error(`Missing required environment variable: ${key}.${suffix}`)
  }
  return value
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    getEnv('NEXT_PUBLIC_SUPABASE_URL') &&
      getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') &&
      getEnv('SUPABASE_SERVICE_ROLE_KEY')
  )
}

export function hasAuthDatabase(): boolean {
  return Boolean(getEnv('DATABASE_URL') && getEnv('BETTER_AUTH_SECRET'))
}
