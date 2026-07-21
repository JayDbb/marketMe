'use client'

import { Suspense, useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signInWithMagicLink, type AuthActionState } from '@/app/login/actions'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { AuthShell } from '@/components/auth/auth-shell'
import {
  AuthAlert,
  AuthDivider,
  AuthEmailField,
  AuthMethodTabs,
  AuthPasswordField,
  AuthPrimaryButton,
  type AuthMethod,
} from '@/components/auth/auth-ui'

function LoginForm() {
  const searchParams = useSearchParams()
  const queryMessage = searchParams.get('message')
  const queryType = searchParams.get('type')
  const [method, setMethod] = useState<AuthMethod>('password')
  const [passwordState, passwordAction] = useActionState(login, {} as AuthActionState)
  const [magicState, magicAction] = useActionState(signInWithMagicLink, {} as AuthActionState)

  const actionState = method === 'magic' ? magicState : passwordState
  const message = actionState.error ?? actionState.success ?? queryMessage
  const type = actionState.error ? 'error' : actionState.success ? 'success' : queryType

  return (
    <AuthShell
      mode="login"
      headline="Login to continue"
      alternatePrompt="Don't have an account?"
      alternateHref="/signup"
      alternateLabel="Sign up"
    >
      <AuthMethodTabs value={method} onChange={setMethod} />
      <AuthAlert message={message} type={type} />

      {method === 'magic' ? (
        <form id="magic-link-form" action={magicAction} className="space-y-4">
          <AuthEmailField id="magic-email" />
          <AuthPrimaryButton idleLabel="Send magic link" pendingLabel="Sending..." />
        </form>
      ) : (
        <form id="login-form" action={passwordAction} className="space-y-4">
          <AuthEmailField id="email" />
          <AuthPasswordField id="password" />
          <AuthPrimaryButton idleLabel="Sign in" pendingLabel="Signing in..." />
        </form>
      )}

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
