import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Get the authenticated Better Auth session + business profile.
 * Replaces the old Supabase-Auth-based getUserAndProfile.
 * Cached per request via React cache().
 */
export const getUserAndProfile = cache(async () => {
  let session
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    return { user: null, profile: null }
  }

  if (!session) {
    return { user: null, profile: null }
  }

  const user = session.user

  const { data: profile } = await supabaseAdmin
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { user, profile: profile ?? null }
})
