import type { SocialConnection } from '@/types/social'
import { normalizeInstagramHandle } from '@/lib/social/oauth'

/** True when we have a real Instagram username (not an OAuth placeholder). */
export function hasRealInstagramHandle(
  handle: string | null | undefined
): boolean {
  return Boolean(normalizeInstagramHandle(handle))
}

export function getInstagramAccountLabel(connection: SocialConnection): {
  handle: string | null
  atHandle: string | null
  title: string
  subtitle: string
  profileUrl: string | null
  isPlaceholder: boolean
} {
  const handle = normalizeInstagramHandle(connection.handle) ?? null
  const isPlaceholder = !handle

  return {
    handle,
    atHandle: handle ? `@${handle}` : null,
    title: handle ? `@${handle}` : 'Instagram connected',
    subtitle: handle
      ? connection.displayName &&
        !connection.displayName.replace(/^@/, '').toLowerCase().includes(handle.toLowerCase())
        ? connection.displayName
        : 'Business / Creator account'
      : 'Username will appear after the next sync or reconnect',
    profileUrl: handle ? `https://www.instagram.com/${handle}/` : null,
    isPlaceholder,
  }
}
