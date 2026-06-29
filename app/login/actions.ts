'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    // nextCookies() plugin automatically handles cookie setting after sign-in
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid email or password'
    redirect(`/login?message=${encodeURIComponent(message)}&type=error`)
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signInWithMagicLink(formData: FormData) {
  // Better Auth supports magic links via the magic-link plugin.
  // To enable: add magicLink() plugin to lib/auth.ts and configure email provider.
  void formData
  redirect('/login?message=Magic link sign-in is being set up. Please use email and password or Google.&type=error')
}

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string | null

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
    redirect(`/signup?message=${encodeURIComponent(message)}&type=error`)
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function logout() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
  } catch {
    // Ignore sign-out errors — redirect regardless
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
