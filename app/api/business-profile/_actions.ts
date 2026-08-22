'use server'

import { getSession } from '@/lib/services/auth.service'
import {
  getBusinessProfile,
  upsertBusinessProfile,
  deleteBusinessProfile,
} from '@/lib/services/business.service'
import { rateLimitMessage } from '@/lib/rate-limit'
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

  const limited = rateLimitMessage(
    `business-profile:action-get:${session.user.id}`,
    60,
    60_000
  )
  if (limited) return { data: null, error: limited }

  return getBusinessProfile(session.user.id)
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

  const limited = rateLimitMessage(
    `business-profile:action-put:${session.user.id}`,
    20,
    60_000
  )
  if (limited) return { data: null, error: limited }

  return upsertBusinessProfile(session.user.id, input)
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

  const limited = rateLimitMessage(
    `business-profile:action-delete:${session.user.id}`,
    5,
    60_000
  )
  if (limited) return { success: false, error: limited }

  return deleteBusinessProfile(session.user.id)
}
