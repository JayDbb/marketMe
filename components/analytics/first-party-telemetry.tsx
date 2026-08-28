'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { readCookieConsent } from '@/lib/cookie-consent'

function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.analytics === true
}

function postBeacon(payload: unknown) {
  const body = JSON.stringify(payload)
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/api/analytics/collect', blob)
    return
  }
  void fetch('/api/analytics/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

/**
 * First-party telemetry: Web Vitals + consent-gated pageviews.
 * No third-party scripts; data stays in MarketMe Supabase.
 */
export function FirstPartyTelemetry() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastPath = useRef<string | null>(null)
  const vitalsBuffer = useRef<
    Array<{ name: string; value: number; rating?: string; path: string }>
  >([])
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flushVitals = () => {
    if (vitalsBuffer.current.length === 0) return
    const samples = vitalsBuffer.current.splice(0, vitalsBuffer.current.length)
    postBeacon({ type: 'vitals', samples })
  }

  useReportWebVitals((metric) => {
    if (!hasAnalyticsConsent()) return
    vitalsBuffer.current.push({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: pathname || '/',
    })
    if (flushTimer.current) clearTimeout(flushTimer.current)
    flushTimer.current = setTimeout(flushVitals, 1500)
  })

  useEffect(() => {
    if (!hasAnalyticsConsent()) return
    const path =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    if (lastPath.current === path) return
    lastPath.current = path
    postBeacon({
      type: 'pageview',
      path: pathname || '/',
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    })
  }, [pathname, searchParams])

  useEffect(() => {
    const onHide = () => flushVitals()
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide()
    })
    window.addEventListener('pagehide', onHide)
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current)
      flushVitals()
      window.removeEventListener('pagehide', onHide)
    }
  }, [])

  return null
}
