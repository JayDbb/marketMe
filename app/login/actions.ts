'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // To support standard flow with email confirmation
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    redirect('/signup?message=Could not create user')
  }

  // If email confirmation is disabled, user is automatically signed in. If not, they must check email.
  // We'll redirect to a generic success message or dashboard. 
  // Let's redirect to login with a message so they know to check their email if standard flow is active.
  redirect('/login?message=Check email to continue sign in process')
}

export async function logout() {
  const supabase = await createClient()
  
  // Enforce a strict timeout so a slow/blocked local database doesn't freeze the app
  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800))
    ])
  } catch (e) {
    console.warn('Logout network timeout - proceeding with local session clear', e)
  }
  
  // Removed revalidatePath('/', 'layout') to prevent unnecessary heavy server rendering 
  // of the entire dashboard tree when the user is just leaving.
  redirect('/login')
}
