'use server'

import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { ensureUserSubscription } from '@/lib/services/account.service'
import { revalidatePath } from 'next/cache'

export async function createBillingPortalSession(): Promise<{
  url?: string
  error?: string
}> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return { error: 'Billing portal is not configured yet.' }
  }

  const subscription = await ensureUserSubscription(user.id)
  if (!subscription.stripe_customer_id) {
    return { error: 'No billing account linked. Upgrade to a paid plan first.' }
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(secretKey)

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/dashboard/settings?tab=Billing`,
    })

    return { url: session.url }
  } catch (e) {
    console.error('Stripe portal error:', e)
    return { error: 'Could not open billing portal.' }
  }
}

export async function refreshAccountContext() {
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/settings')
}
