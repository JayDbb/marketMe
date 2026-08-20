'use server'

import { grantAdminCredits, updateUserPlan } from '@/lib/services/admin.service'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

async function assertAdmin() {
  const user = await getAuthenticatedUser()
  if (!user) throw new Error('Not authenticated')
  
  const allowedEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const userEmail = (user.email ?? '').trim().toLowerCase()
  if (allowedEmails.length === 0 || !allowedEmails.includes(userEmail)) {
    throw new Error('Not authorized')
  }
  return user
}

export async function grantCreditsAction(
  userId: string,
  amount: number
): Promise<{ error: string | null }> {
  try {
    await assertAdmin()
    return await grantAdminCredits(userId, amount)
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function updatePlanAction(
  userId: string,
  plan: 'free' | 'pro' | 'team'
): Promise<{ error: string | null }> {
  try {
    await assertAdmin()
    return await updateUserPlan(userId, plan)
  } catch (err) {
    return { error: (err as Error).message }
  }
}
