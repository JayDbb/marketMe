'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthAlert } from '@/components/auth/auth-ui'

function LoginForm() {
  const searchParams = useSearchParams()
  const queryMessage = searchParams.get('message')
  const queryType = searchParams.get('type')

  return (
    <AuthShell
      mode="login"
      headline="Login to continue"
      alternatePrompt="Don't have an account?"
      alternateHref="/signup"
      alternateLabel="Sign up"
    >
      <AuthAlert message={queryMessage} type={queryType} />

      <p className="mb-5 text-sm leading-relaxed text-zinc-600">
        Sign in with Google to continue to your Marketme workspace.
      </p>

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
