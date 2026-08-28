'use client'

import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_PREFERENCES_OPEN_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from '@/lib/cookie-consent'

function subscribeConsent(onStoreChange: () => void) {
  const handler = () => onStoreChange()
  window.addEventListener('storage', handler)
  window.addEventListener(COOKIE_CONSENT_EVENT, handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(COOKIE_CONSENT_EVENT, handler)
  }
}

function getConsentSnapshot() {
  return readCookieConsent() !== null
}

/** SSR: hide banner to avoid hydration mismatch; client decides after hydrate. */
function getServerConsentSnapshot() {
  return true
}

export function CookieConsentBanner() {
  const hasStoredConsent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  )
  const [forceOpen, setForceOpen] = useState(false)
  const [customize, setCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const onOpen = () => {
      const existing = readCookieConsent()
      if (existing) {
        setAnalytics(existing.analytics)
        setMarketing(existing.marketing)
      }
      setCustomize(true)
      setForceOpen(true)
    }
    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, onOpen)
  }, [])

  const visible = forceOpen || !hasStoredConsent

  if (!visible) return null

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    writeCookieConsent(next)
    setForceOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-9998 p-4 md:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#0d1117]/95 p-5 shadow-[0_-12px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-6">
        <h2 id="cookie-consent-title" className="font-serif text-lg text-white">
          Cookies & privacy choices
        </h2>
        <p id="cookie-consent-desc" className="mt-2 text-sm leading-relaxed text-white/60">
          We use necessary cookies to run Marketme. Analytics and marketing cookies are optional
          and used only if you allow them. See our{' '}
          <Link href="/cookies" className="text-sky-300 underline underline-offset-2">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-sky-300 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>

        {customize ? (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <span className="text-white">Necessary</span> — required for login, security, and
                basic site function.
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="text-white">Analytics</span> — help us understand product usage.
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="text-white">Marketing</span> — measure campaigns (if enabled).
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => save({ analytics: true, marketing: true })}
            className="min-h-11 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="min-h-11 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
          >
            Necessary only
          </button>
          {customize ? (
            <button
              type="button"
              onClick={() => save({ analytics, marketing })}
              className="min-h-11 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
            >
              Save choices
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCustomize(true)}
              className="min-h-11 rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white"
            >
              Customize
            </button>
          )}
          {forceOpen ? (
            <button
              type="button"
              onClick={() => setForceOpen(false)}
              className="min-h-11 rounded-lg px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
