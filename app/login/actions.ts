'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getPostAuthRedirectPath } from '@/lib/post-auth-redirect'
import { getClientIp } from '@/lib/client-ip'
import { rateLimitOrThrow } from '@/lib/rate-limit'

export type AuthActionState = {
  error?: string
  success?: string
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIp()
  try {
    await rateLimitOrThrow(`auth:login:${ip}`, 10, 15 * 60_000)
  } catch {
    return { error: 'Too many login attempts. Please wait and try again.' }
  }

  const email = (formData.get('email') as string | null)?.trim()
  const password = (formData.get('password') as string | null) ?? ''

  if (!email) {
    return { error: 'Enter your email address to continue.' }
  }

  if (!password) {
    return { error: 'Enter your password or switch to Magic Link.' }
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid email or password'
    return { error: message }
  }

  revalidatePath('/', 'layout')
  redirect(await getPostAuthRedirectPath())
}

export async function signInWithMagicLink(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIp()
  try {
    await rateLimitOrThrow(`auth:magic:${ip}`, 5, 15 * 60_000)
  } catch {
    return { error: 'Too many magic link requests. Wait a few minutes, then try again.' }
  }

  const email = (formData.get('email') as string | null)?.trim()
  if (!email) {
    return { error: 'Enter your email address to get a sign-in link.' }
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    return {
      error:
        'Magic link email is not configured. Use email and password or Google.',
    }
  }

  try {
    await auth.api.signInMagicLink({
      body: {
        email,
        callbackURL: '/auth/complete',
        newUserCallbackURL: '/onboarding',
        errorCallbackURL: '/login?message=Magic+link+expired+or+invalid&type=error',
      },
      headers: await headers(),
    })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Failed to send magic link'
    return { error: message }
  }

  return { success: 'Check your email for a sign-in link. It expires in 10 minutes.' }
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIp()
  try {
    await rateLimitOrThrow(`auth:signup:${ip}`, 5, 60 * 60_000)
  } catch {
    return { error: 'Too many sign-up attempts. Wait a little while, then try again.' }
  }

  const email = (formData.get('email') as string | null)?.trim()
  const password = (formData.get('password') as string | null) ?? ''
  const name = formData.get('name') as string | null
  const acceptedTerms = formData.get('accepted_terms') === 'yes'

  if (!acceptedTerms) {
    return { error: 'Accept the Terms to create an account.' }
  }

  if (!email) {
    return { error: 'Enter your email address to create an account.' }
  }

  if (password.length < 6) {
    return { error: 'Use a password with at least 6 characters.' }
  }

  try {
    const userResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name ?? email.split('@')[0],
      },
      headers: await headers(),
    })

    if (userResult?.user?.id) {
      await supabaseAdmin
        .from('user')
        .update({ emailVerified: true })
        .eq('id', userResult.user.id)
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sign up failed'
    return { error: message }
  }

  revalidatePath('/', 'layout')
  redirect(await getPostAuthRedirectPath())
}

export async function logout() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
  } catch {
    // Redirect regardless
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
