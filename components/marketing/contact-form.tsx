'use client'

import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TOPICS = [
  { value: 'support', label: 'Product & account support' },
  { value: 'privacy', label: 'Privacy / data request' },
  { value: 'legal', label: 'Legal' },
  { value: 'billing', label: 'Billing' },
  { value: 'other', label: 'Other' },
] as const

type TopicValue = (typeof TOPICS)[number]['value']

function isTopic(value: string | null): value is TopicValue {
  return TOPICS.some((t) => t.value === value)
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400/30'

export function ContactForm() {
  const searchParams = useSearchParams()
  const topicParam = searchParams.get('topic')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<TopicValue>(
    isTopic(topicParam) ? topicParam : 'support'
  )
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setStatus('error')
        setError(data.error || 'Could not send message. Try email instead.')
        return
      }
      setStatus('sent')
      setName('')
      setEmail('')
      setMessage('')
      setTopic('support')
    } catch {
      setStatus('error')
      setError('Network error. Check your connection or email us directly.')
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100"
      >
        <p className="font-medium text-white">Message sent</p>
        <p className="mt-2 text-white/60">
          Thanks — we usually reply within 1–2 business days (Jamaica time). Check your inbox
          (and spam) for our response.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-sky-300 hover:text-sky-200"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div>
        <h2 className="font-serif text-xl text-white">Send a message</h2>
        <p className="mt-1 text-sm text-white/45">
          We aim to reply within 1–2 business days. For urgent account lockouts, email support
          directly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-medium tracking-wide text-white/50 uppercase">
          Name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="Your name"
          />
        </label>
        <label className="block text-xs font-medium tracking-wide text-white/50 uppercase">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder="you@business.com"
          />
        </label>
      </div>

      <label className="block text-xs font-medium tracking-wide text-white/50 uppercase">
        Topic
        <select
          name="topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value as typeof topic)}
          className={fieldClass}
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value} className="bg-[#0d1117] text-white">
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-medium tracking-wide text-white/50 uppercase">
        Message
        <textarea
          name="message"
          required
          rows={5}
          minLength={20}
          maxLength={4000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(fieldClass, 'resize-y')}
          placeholder="How can we help?"
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className={cn(
          buttonVariants({ size: 'default' }),
          'min-h-11 w-full rounded-full border-0 bg-sky-500 text-white hover:bg-sky-400 disabled:opacity-60 sm:w-auto sm:px-8'
        )}
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          'Send message'
        )}
      </button>
    </form>
  )
}
