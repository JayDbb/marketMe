'use client'

import { Suspense, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithMagicLink, type AuthActionState } from '@/app/login/actions'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { AuthShell } from '@/components/auth/auth-shell'
import {
  AuthAlert,
  AuthDivider,
  AuthEmailField,
  AuthPrimaryButton,
} from '@/components/auth/auth-ui'

function LoginForm() {
  const searchParams = useSearchParams()
  const queryMessage = searchParams.get('message')
  const queryType = searchParams.get('type')
  const [magicState, magicAction] = useActionState(
    signInWithMagicLink,
    {} as AuthActionState
  )

  const message = magicState.error ?? magicState.success ?? queryMessage
  const type = magicState.error
    ? 'error'
    : magicState.success
      ? 'success'
      : queryType

  return (
    <AuthShell
      mode="login"
      headline="Login to continue"
      alternatePrompt="Don't have an account?"
      alternateHref="/signup"
      alternateLabel="Sign up"
    >
      <AuthAlert message={message} type={type} />

      <form id="magic-link-form" action={magicAction} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Email</p>
          <AuthEmailField id="magic-email" />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            We’ll email you a magic link to sign in — no password needed.
          </p>
        </div>
        <AuthPrimaryButton idleLabel="Send magic link" pendingLabel="Sending..." />
      </form>

      <AuthDivider />
      <GoogleAuthButton />
    </AuthShell>
  )
}

function LoginFallback() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
