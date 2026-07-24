'use client'

import { useFormStatus } from 'react-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export const authInputClassName =
  'h-11 rounded-lg border-zinc-200 bg-white pl-10 text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300'

export type AuthMethod = 'magic' | 'password'

export function AuthMethodTabs({
  value,
  onChange,
}: {
  value: AuthMethod
  onChange: (method: AuthMethod) => void
}) {
  return (
    <div
      className="mb-6 flex rounded-lg border border-zinc-200 bg-zinc-100/80 p-1"
      role="tablist"
      aria-label="Sign-in method"
    >
      {(
        [
          { id: 'magic' as const, label: 'Magic link' },
          { id: 'password' as const, label: 'Password' },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 rounded-md py-2 text-sm font-medium transition-all',
            value === tab.id
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
              : 'text-zinc-500 hover:text-zinc-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function AuthAlert({ message, type }: { message: string | null; type: string | null }) {
  if (!message) return null

  const styles =
    type === 'success'
      ? 'border-sky-200 bg-sky-50 text-sky-800'
      : type === 'error'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-zinc-200 bg-zinc-50 text-zinc-700'

  return (
    <div role="alert" aria-live="polite" className={cn('mb-4 rounded-lg border px-3 py-2.5 text-sm', styles)}>
      {message}
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="relative my-6" aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-zinc-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-white px-3 text-zinc-400">or</span>
      </div>
    </div>
  )
}

export function AuthEmailField({
  id,
  name = 'email',
  placeholder = 'name@company.com',
  required = true,
}: {
  id: string
  name?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="relative">
      <Mail
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden="true"
      />
      <Input
        id={id}
        name={name}
        type="email"
        placeholder={placeholder}
        autoComplete="email"
        spellCheck={false}
        required={required}
        className={authInputClassName}
      />
    </div>
  )
}

export function AuthPasswordField({
  id,
  name = 'password',
  placeholder = 'Your password',
  autoComplete = 'current-password',
  minLength = 6,
}: {
  id: string
  name?: string
  placeholder?: string
  autoComplete?: string
  minLength?: number
}) {
  return (
    <div className="relative">
      <Lock
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden="true"
      />
      <Input
        id={id}
        name={name}
        type="password"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        className={authInputClassName}
      />
    </div>
  )
}

export function AuthField({
  id,
  label,
  type = 'text',
  name,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  id: string
  label: string
  type?: string
  name: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        spellCheck={false}
        required={required}
        minLength={minLength}
        className="h-11 rounded-lg border-zinc-200 bg-white text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300"
      />
    </div>
  )
}

export function AuthPrimaryButton({
  idleLabel,
  pendingLabel,
  disabled = false,
}: {
  idleLabel: string
  pendingLabel: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  const isDisabled = pending || disabled
  return (
    <Button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border-0 bg-zinc-900 font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        idleLabel
      )}
    </Button>
  )
}
