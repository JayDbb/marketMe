'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithMagicLink, type AuthActionState } from '@/app/login/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all border-0 flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-zinc-800 border-t-zinc-950 rounded-full animate-spin" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>
      )}
      {pending ? 'Sending...' : 'Send Magic Link'}
    </Button>
  )
}

export function MagicLinkForm({
  searchParams
}: {
  searchParams?: { message?: string, type?: string }
}) {
  const [state, formAction] = useActionState(signInWithMagicLink, {} as AuthActionState)
  const errorMessage = state.error ?? (searchParams?.type !== 'success' ? searchParams?.message : undefined)
  const successMessage = state.success ?? (searchParams?.type === 'success' ? searchParams?.message : undefined)

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="magic-email" className="text-zinc-300 font-medium">Email Address</Label>
        <Input
          id="magic-email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
          className="h-12 bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all rounded-xl"
        />
      </div>
      
      {successMessage && (
        <p className="text-sm font-medium text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
          {errorMessage}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
