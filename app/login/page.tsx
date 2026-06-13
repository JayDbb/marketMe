'use client'

import { useFormStatus } from 'react-dom'
import { login } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Activity, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full h-12 bg-white hover:bg-white/90 text-zinc-950 font-bold tracking-wide rounded-xl transition-all border-0 flex items-center justify-center gap-2 mt-6 shadow-[0_0_30px_rgba(99,130,255,0.2)] active:scale-[0.97] disabled:opacity-60"
    >
      {pending ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
      ) : (
        <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
      )}
    </Button>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative min-h-screen bg-[#0a0a14] flex flex-col justify-center items-center p-4 font-sans overflow-hidden">

      {/* Ambient blue orb */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" aria-hidden="true" />

      <Link
        href="/"
        className="absolute top-6 left-6 text-white/40 hover:text-white/80 flex items-center gap-2 text-sm transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to home
      </Link>

      {/* Logo */}
      <div className="z-10 mb-8 flex flex-col items-center">
        <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
          <Activity className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-serif font-light text-white tracking-tighter">Marketme</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/5 border border-white/8 backdrop-blur-xl text-white shadow-2xl z-10 p-8 sm:p-10 rounded-2xl">
        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
          <p className="text-white/45 text-sm">Sign in to your account to continue.</p>
        </div>

        <div className="space-y-5">
          {/* Google */}
          <GoogleAuthButton />

          <div className="relative" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
              <span className="bg-[#0e0e1c] px-4 text-white/30">Or email</span>
            </div>
          </div>

          <form id="login-form" action={login} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/50 font-medium text-xs uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                spellCheck={false}
                required
                className="h-11 bg-white/5 border-white/10 focus-visible:border-blue-400/60 focus-visible:ring-0 text-white placeholder:text-white/25 rounded-xl transition-all text-sm shadow-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/50 font-medium text-xs uppercase tracking-wider">
                  Password
                </Label>
                <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="h-11 bg-white/5 border-white/10 focus-visible:border-blue-400/60 focus-visible:ring-0 text-white placeholder:text-white/25 rounded-xl transition-all text-sm shadow-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {message && (
              <div role="alert" aria-live="polite" className="text-sm font-medium text-red-400 bg-red-500/10 p-3 border border-red-500/20 text-center rounded-xl">
                {message}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>

        <div className="text-center text-sm text-white/30 pt-6 border-t border-white/8 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create one
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
