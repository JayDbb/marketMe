import { useSyncExternalStore } from "react"

export const MOBILE_BREAKPOINT = 768

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

/**
 * Prefer false on the server so desktop chrome doesn’t flash as a sheet.
 * SidebarTrigger must also check live viewport width so the first tap works
 * before this hook hydrates.
 */
function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Live viewport check — safe in click handlers before/after hydration. */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth < MOBILE_BREAKPOINT
}
