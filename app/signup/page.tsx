'use client'

import { Suspense, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signup, type AuthActionState } from '@/app/login/actions'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { AuthShell } from '@/components/auth/auth-shell'
import {
  AuthAlert,
  AuthDivider,
  AuthField,
  AuthPrimaryButton,
} from '@/components/auth/auth-ui'

function SignupForm() {
  const searchParams = useSearchParams()
  const queryMessage = searchParams.get('message')
  const queryType = searchParams.get('type')
  const [state, formAction] = useActionState(signup, {} as AuthActionState)
  const message = state.error ?? state.success ?? queryMessage
  const type = state.error ? 'error' : state.success ? 'success' : queryType

  return (
    <AuthShell
      mode="signup"
      headline="Create your account"
      alternatePrompt="Already have an account?"
      alternateHref="/login"
      alternateLabel="Sign in"
    >
      <AuthAlert message={message} type={type} />

      <form id="signup-form" action={formAction} className="space-y-4">
        <AuthField
          id="name"
          label="Full name"
          name="name"
          type="text"
          placeholder="Alex Rivera"
          autoComplete="name"
          required
        />
        <AuthField
          id="email"
          label="Email"
          name="email"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          required
        />
        <AuthField
          id="password"
          label="Password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          required
          minLength={6}
        />

        <p className="text-[11px] leading-relaxed text-zinc-400">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-600">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-600">
            Privacy Policy
          </Link>
          .
        </p>

        <AuthPrimaryButton idleLabel="Create account" pendingLabel="Creating account..." />
      </form>

      <AuthDivider />
      <GoogleAuthButton />
    </AuthShell>
  )
}

function SignupFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0e14]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  )
}
