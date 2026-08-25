export const COOKIE_CONSENT_STORAGE_KEY = 'marketme-cookie-consent-v1'
export const COOKIE_PREFERENCES_OPEN_EVENT = 'marketme:cookie-preferences-open'
export const COOKIE_CONSENT_EVENT = 'marketme:cookie-consent'

export type ConsentState = {
  necessary: true
  analytics: boolean
  marketing: boolean
  decidedAt: string
}

export function readCookieConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentState
  } catch {
    return null
  }
}

export function writeCookieConsent(
  next: Omit<ConsentState, 'necessary' | 'decidedAt'>
): ConsentState {
  const value: ConsentState = {
    necessary: true,
    analytics: next.analytics,
    marketing: next.marketing,
    decidedAt: new Date().toISOString(),
  }
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }))
  return value
}

/** Open the cookie preference dialog even after a prior choice. */
export function openCookiePreferences() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_OPEN_EVENT))
}
