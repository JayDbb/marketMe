import { supabaseAdmin } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/billing-utils'
import type { PlanId } from '@/types/billing'
import {
  PIPELINE_CREDIT_COSTS,
  PLAN_CREDIT_ALLOWANCES,
  type PipelineStage,
} from '@/types/pipeline'

export class InsufficientCreditsError extends Error {
  readonly status = 402

  constructor(required: number, available: number) {
    super(`Insufficient credits: need ${required}, have ${available}`)
    this.name = 'InsufficientCreditsError'
  }
}

type SubscriptionCredits = {
  credits_balance: number
  credits_reset_at: string
  plan: PlanId
}

/** Detects a missing credits column/table (migration 024 not yet applied). */
function isMissingCreditsSchema(message: string): boolean {
  return (
    /credits_balance/.test(message) ||
    /credits_reset_at/.test(message) ||
    /credit_transactions/.test(message)
  ) && /does not exist/.test(message)
}

async function getSubscriptionCredits(userId: string): Promise<SubscriptionCredits> {
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('credits_balance, credits_reset_at, plan')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (isMissingCreditsSchema(error.message)) {
      console.warn(
        '[credits] Migration 024 not applied — falling back to plan default. Run: npm run migrate supabase/migrations/024_pipeline_foundation.sql'
      )
      return {
        credits_balance: PLAN_CREDIT_ALLOWANCES.free,
        credits_reset_at: nextMonthStart().toISOString(),
        plan: 'free',
      }
    }
    throw new Error(`Failed to load credits: ${error.message}`)
  }

  if (!data) {
    const allowance = PLAN_CREDIT_ALLOWANCES.free
    const resetAt = nextMonthStart().toISOString()
    await supabaseAdmin.from('user_subscriptions').insert({
      user_id: userId,
      plan: 'free',
      status: 'active',
      credits_balance: allowance,
      credits_reset_at: resetAt,
    })
    return { credits_balance: allowance, credits_reset_at: resetAt, plan: 'free' }
  }

  const row = data as SubscriptionCredits
  if (new Date(row.credits_reset_at) <= new Date()) {
    const allowance = PLAN_CREDIT_ALLOWANCES[row.plan] ?? PLANS[row.plan]?.limits.aiCredits ?? 50
    const resetAt = nextMonthStart().toISOString()
    await supabaseAdmin
      .from('user_subscriptions')
      .update({ credits_balance: allowance, credits_reset_at: resetAt })
      .eq('user_id', userId)
    return { credits_balance: allowance, credits_reset_at: resetAt, plan: row.plan }
  }

  return row
}

function nextMonthStart(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function getCreditsBalance(userId: string): Promise<number> {
  const sub = await getSubscriptionCredits(userId)
  return sub.credits_balance
}

export async function assertCreditsAvailable(
  userId: string,
  stage: PipelineStage
): Promise<void> {
  const cost = PIPELINE_CREDIT_COSTS[stage]
  if (cost === 0) return

  const balance = await getCreditsBalance(userId)
  if (balance < cost) {
    throw new InsufficientCreditsError(cost, balance)
  }
}

export async function spendCredits(
  userId: string,
  stage: PipelineStage,
  options?: {
    businessProfileId?: string
    generationId?: string
    metadata?: Record<string, unknown>
  }
): Promise<{ transactionId: string | null; newBalance: number }> {
  const cost = PIPELINE_CREDIT_COSTS[stage]
  if (cost === 0) {
    const balance = await getCreditsBalance(userId)
    return { transactionId: null, newBalance: balance }
  }

  const sub = await getSubscriptionCredits(userId)
  if (sub.credits_balance < cost) {
    throw new InsufficientCreditsError(cost, sub.credits_balance)
  }

  const newBalance = sub.credits_balance - cost

  const { error: updateError } = await supabaseAdmin
    .from('user_subscriptions')
    .update({ credits_balance: newBalance })
    .eq('user_id', userId)

  if (updateError) {
    if (isMissingCreditsSchema(updateError.message)) {
      return { transactionId: null, newBalance: sub.credits_balance }
    }
    throw new Error(`Failed to deduct credits: ${updateError.message}`)
  }

  const { data: tx, error: txError } = await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_id: userId,
      business_profile_id: options?.businessProfileId ?? null,
      stage,
      credits_spent: cost,
      generation_id: options?.generationId ?? null,
      metadata: options?.metadata ?? {},
    })
    .select('id')
    .single()

  if (txError) {
    if (isMissingCreditsSchema(txError.message)) {
      return { transactionId: null, newBalance }
    }
    throw new Error(`Failed to record credit transaction: ${txError.message}`)
  }

  return { transactionId: tx.id as string, newBalance }
}
