'use server'

import { getSession } from '@/lib/services/auth.service'
import {
  getBusinessProfile as fetchBusinessProfile,
  upsertBusinessProfile as saveBusinessProfile,
  deleteBusinessProfile as removeBusinessProfile,
} from '@/lib/services/business.service'
import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'

/**
 * Get the business profile for the currently authenticated user.
 * Returns null if no profile exists yet.
 */
export async function getBusinessProfileAction(): Promise<{
  data: BusinessProfile | null
  error: string | null
}> {
  const session = await getSession()

  if (!session) {
    return { data: null, error: 'Not authenticated' }
  }

  return fetchBusinessProfile(session.user.id)
}

/**
 * Create or update the business profile for the currently authenticated user.
 * Uses upsert so it works for both initial onboarding and later edits.
 */
export async function upsertBusinessProfileAction(
  input: BusinessProfileInput
): Promise<{
  data: BusinessProfile | null
  error: string | null
}> {
  const session = await getSession()

  if (!session) {
    return { data: null, error: 'Not authenticated' }
  }

  return saveBusinessProfile(session.user.id, input)
}

/**
 * Delete the business profile for the currently authenticated user.
 */
export async function deleteBusinessProfileAction(): Promise<{
  success: boolean
  error: string | null
}> {
  const session = await getSession()

  if (!session) {
    return { success: false, error: 'Not authenticated' }
  }

  return removeBusinessProfile(session.user.id)
}

/** Compatibility aliases for existing call sites. */
export {
  getBusinessProfileAction as getBusinessProfile,
  upsertBusinessProfileAction as upsertBusinessProfile,
  deleteBusinessProfileAction as deleteBusinessProfile,
}
