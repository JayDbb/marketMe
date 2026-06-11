'use client'

import { useFormStatus } from 'react-dom'
import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, Activity, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

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
        <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
      ) : (
        <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
      )}
    </Button>
  )
}

export default function SignupPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const passwordStrength = passwordValue.length === 0
    ? null
    : passwordValue.length < 8
    ? 'weak'
    : passwordValue.length < 12
    ? 'good'
    : 'strong'

  const strengthConfig = {
    weak: { label: 'Too short', color: 'bg-red-500', width: 'w-1/3', textColor: 'text-red-400' },
    good: { label: 'Good', color: 'bg-amber-500', width: 'w-2/3', textColor: 'text-amber-400' },
    strong: { label: 'Strong', color: 'bg-blue-500', width: 'w-full', textColor: 'text-blue-400' },
  }

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
          <h2 className="text-2xl font-semibold tracking-tight text-white">Create an account</h2>
          <p className="text-white/45 text-sm">14-day free trial. No credit card required.</p>
        </div>

        <div className="space-y-5">
          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-11 bg-white/5 hover:bg-white/8 text-white border border-white/12 font-medium rounded-xl transition-all flex items-center justify-center gap-3"
            aria-label="Sign up with Google"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>

          <div className="relative" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
              <span className="bg-[#0e0e1c] px-4 text-white/30">Or email</span>
            </div>
          </div>

          <form id="signup-form" action={signup} className="space-y-5">
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
              <Label htmlFor="password" className="text-white/50 font-medium text-xs uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={passwordValue}
                  onChange={e => setPasswordValue(e.target.value)}
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
              {/* Password strength */}
              {passwordStrength && (
                <div aria-live="polite">
                  <div className="w-full h-1 bg-white/8 mt-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 rounded-full ${strengthConfig[passwordStrength].color} ${strengthConfig[passwordStrength].width}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strengthConfig[passwordStrength].textColor}`}>
                    {strengthConfig[passwordStrength].label}
                  </p>
                </div>
              )}
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
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
