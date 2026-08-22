'use server'

import { revalidatePath } from 'next/cache'
import {
  grantAdminCredits,
  searchAdminUsers,
  updateUserPlan,
} from '@/lib/services/admin.service'
import { checkIsAdmin } from '@/lib/admin-auth'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import type { AdminPlanId, AdminUserSearchResult } from '@/types/admin'

async function assertAdmin() {
  const user = await getAuthenticatedUser()
  if (!user) throw new Error('Not authenticated')

  const userEmail = (user.email ?? '').trim().toLowerCase()
  if (!(await checkIsAdmin({ userId: user.id, email: userEmail }))) {
    throw new Error('Not authorized')
  }
  return { id: user.id, email: userEmail }
}

export async function grantCreditsAction(
  userId: string,
  amount: number
): Promise<{ error: string | null }> {
  try {
    const actor = await assertAdmin()
    const result = await grantAdminCredits(userId, amount, actor)
    if (!result.error) revalidatePath('/dashboard/admin')
    return result
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function updatePlanAction(
  userId: string,
  plan: AdminPlanId
): Promise<{ error: string | null }> {
  try {
    const actor = await assertAdmin()
    const result = await updateUserPlan(userId, plan, actor)
    if (!result.error) revalidatePath('/dashboard/admin')
    return result
  } catch (err) {
    return { error: (err as Error).message }
  }
}

export async function searchUsersAction(input: {
  query?: string
  plan?: AdminPlanId | 'all'
  page?: number
  pageSize?: number
}): Promise<{ data: AdminUserSearchResult | null; error: string | null }> {
  try {
    await assertAdmin()
    const data = await searchAdminUsers(input)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: (err as Error).message }
  }
}
