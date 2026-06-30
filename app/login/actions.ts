'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getPostAuthRedirectPath } from '@/lib/post-auth-redirect'

export type AuthActionState = {
  error?: string
  success?: string
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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
  void formData
  return {
    error:
      'Magic link sign-in is being set up. Please use email and password or Google.',
  }
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
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
