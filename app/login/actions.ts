'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await auth.api.signInWithPassword({
    body: { email, password },
    headers: await headers(),
  })

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}&type=error`)
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signInWithMagicLink(formData: FormData) {
  // Better Auth supports magic links via the magic-link plugin.
  // For now, redirect with a clear message that this method requires plugin setup.
  // To enable: add magicLink() plugin to lib/auth.ts and configure email provider.
  redirect('/login?message=Magic link sign-in is being set up. Please use email and password or Google.&type=error')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string | null

  const { error } = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: name ?? email.split('@')[0],
    },
    headers: await headers(),
  })

  if (error) {
    redirect(`/signup?message=${encodeURIComponent(error.message)}&type=error`)
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  })

  revalidatePath('/', 'layout')
  redirect('/login')
}
