'use client'

import { Suspense, useActionState, useState } from 'react'
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
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
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

        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <label className="flex items-start gap-3 text-[11px] leading-relaxed text-zinc-400">
            <input
              type="checkbox"
              name="accepted_terms"
              value="yes"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-200">
                Terms of Service
              </Link>
              ,{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-200">
                Privacy Policy
              </Link>
              , and{' '}
              <Link
                href="/acceptable-use"
                className="underline underline-offset-2 hover:text-zinc-200"
              >
                Acceptable Use Policy
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3 text-[11px] leading-relaxed text-zinc-400">
            <input
              type="checkbox"
              name="marketing_opt_in"
              value="yes"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Optional: send me product tips and updates by email. I can unsubscribe anytime.
            </span>
          </label>
        </div>

        <AuthPrimaryButton
          idleLabel="Create account"
          pendingLabel="Creating account..."
          disabled={!acceptedTerms}
        />
      </form>

      <AuthDivider />
      <div className={!acceptedTerms ? 'pointer-events-none opacity-50' : undefined}>
        <GoogleAuthButton />
      </div>
      {!acceptedTerms ? (
        <p className="mt-2 text-center text-[11px] text-zinc-500">
          Accept the Terms to continue with Google.
        </p>
      ) : null}
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
