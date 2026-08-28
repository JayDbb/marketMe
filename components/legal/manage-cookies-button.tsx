'use client'

import { openCookiePreferences } from '@/lib/cookie-consent'

export function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openCookiePreferences()}
      className={
        className ??
        'inline-flex min-h-11 items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-500/20 hover:text-sky-200'
      }
    >
      Manage cookies
    </button>
  )
}
