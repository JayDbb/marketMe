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
  AuthPasswordField,
  AuthPrimaryButton,
} from '@/components/auth/auth-ui'
import { Label } from '@/components/ui/label'

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
      headline="Create Your Account"
      alternatePrompt="Already have an account?"
      alternateHref="/login"
      alternateLabel="Sign in"
    >
      <AuthAlert message={message} type={type} />
      <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[11px] leading-relaxed text-zinc-600">
        Start with the fewest steps possible. Business details and profile setup can wait until onboarding.
      </div>

      <div className="space-y-3">
        <GoogleAuthButton disabled={!acceptedTerms} />
        {!acceptedTerms ? (
          <p className="text-center text-[11px] text-zinc-500">
            Accept the Terms to continue with Google.
          </p>
        ) : null}
      </div>

      <AuthDivider />

      <form id="signup-form" action={formAction} className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          name="email"
          type="email"
          placeholder="name@company.com"
          autoComplete="email"
          required
        />
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
            Password
          </Label>
          <AuthPasswordField
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={6}
            hint="Use at least 6 characters. You can add business details after you get in."
          />
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <label className="flex items-start gap-3 text-xs leading-relaxed text-zinc-600">
            <input
              type="checkbox"
              name="accepted_terms"
              value="yes"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-zinc-900"
            />
            <span>
              I agree to the{' '}
              <Link
                href="/terms"
                className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
              >
                Terms of Service
              </Link>
              ,{' '}
              <Link
                href="/privacy"
                className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
              >
                Privacy Policy
              </Link>
              , and{' '}
              <Link
                href="/acceptable-use"
                className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
              >
                Acceptable Use Policy
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3 text-xs leading-relaxed text-zinc-600">
            <input
              type="checkbox"
              name="marketing_opt_in"
              value="yes"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 accent-zinc-900"
            />
            <span>
              Optional: send me product tips and updates by email. I can unsubscribe anytime.
            </span>
          </label>
        </div>

        <AuthPrimaryButton
          idleLabel="Create Account"
          pendingLabel="Creating Account…"
          disabled={!acceptedTerms}
        />
      </form>
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
