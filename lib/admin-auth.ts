import { getSupabaseAdmin } from '@/lib/supabase/admin'

/**
 * Admin authorization.
 *
 * Primary (live): `public."user".is_admin` in Supabase — set in Table Editor / SQL.
 * Optional bootstrap: ADMIN_EMAILS env (local or first-admin seed). Not required in prod
 * if at least one user row has is_admin = true.
 */

export function getAdminEmailsFromEnv(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** Sync env allowlist only — prefer `checkIsAdmin` for real gates. */
export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = (email ?? '').trim().toLowerCase()
  if (!normalized) return false
  const allowed = getAdminEmailsFromEnv()
  return allowed.length > 0 && allowed.includes(normalized)
}

/**
 * Authoritative admin check for sidebar, page, and mutations.
 * 1) Supabase `user.is_admin`
 * 2) Fallback ADMIN_EMAILS (bootstrap / local)
 */
export async function checkIsAdmin(input: {
  userId?: string | null
  email?: string | null
}): Promise<boolean> {
  const userId = input.userId?.trim() || null
  const email = (input.email ?? '').trim().toLowerCase() || null

  if (userId) {
    try {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('user' as never)
        .select('is_admin')
        .eq('id' as never, userId)
        .maybeSingle()

      if (!error && data) {
        const row = data as { is_admin?: boolean }
        if (row.is_admin === true) return true
      } else if (error) {
        // Column may not exist until migration 039 is applied — fall through to env.
        console.warn('[admin-auth] is_admin lookup failed:', error.message)
      }
    } catch (err) {
      console.warn('[admin-auth] is_admin lookup failed:', (err as Error).message)
    }
  }

  if (email && isAdminEmail(email)) return true
  return false
}
