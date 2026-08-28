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
} from '@/components/auth/auth-ui'
import { Label } from '@/components/ui/label'

function LoginForm() {
  const searchParams = useSearchParams()
  const queryMessage = searchParams.get('message')
  const queryType = searchParams.get('type')
  const [method, setMethod] = useState<'magic' | 'password'>('magic')
  const [magicState, magicAction] = useActionState(
    signInWithMagicLink,
    {} as AuthActionState
  )
  const [passwordState, passwordAction] = useActionState(login, {} as AuthActionState)

  const activeState = method === 'magic' ? magicState : passwordState
  const message = activeState.error ?? activeState.success ?? queryMessage
  const type = activeState.error
    ? 'error'
    : activeState.success
      ? 'success'
      : queryType

  return (
    <AuthShell
      mode="login"
      headline="Log In to Continue"
      alternatePrompt="Don't have an account?"
      alternateHref="/signup"
      alternateLabel="Sign up"
    >
      <AuthAlert message={message} type={type} />
      <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[11px] leading-relaxed text-zinc-600">
        Use Google or a magic link for the fastest sign-in. Password remains available as a fallback for existing accounts.
      </div>

      <AuthMethodTabs value={method} onChange={setMethod} />

      {method === 'magic' ? (
        <form id="magic-link-form" action={magicAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email" className="text-sm font-medium text-zinc-700">
              Email
            </Label>
            <AuthEmailField id="magic-email" />
            <p className="text-[11px] leading-relaxed text-zinc-500">
              We&apos;ll email a one-time sign-in link. No password required.
            </p>
          </div>
          <AuthPrimaryButton idleLabel="Send Magic Link" pendingLabel="Sending…" />
        </form>
      ) : (
        <form id="password-form" action={passwordAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password-email" className="text-sm font-medium text-zinc-700">
              Email
            </Label>
            <AuthEmailField id="password-email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Password
            </Label>
            <AuthPasswordField
              id="password"
              hint="If you don&apos;t remember it, switch to Magic Link and sign in from your inbox."
            />
          </div>
          <AuthPrimaryButton idleLabel="Log In" pendingLabel="Signing in…" />
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
