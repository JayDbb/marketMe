const STORAGE_KEY = 'marketme:studio-recents'
const MAX_RECENTS = 12

export type StudioRecentEntry = {
  id: string
  openedAt: string
}

function readRecents(): StudioRecentEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StudioRecentEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRecents(entries: StudioRecentEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_RECENTS)))
}

export function recordStudioRecent(templateId: string) {
  const now = new Date().toISOString()
  const without = readRecents().filter((e) => e.id !== templateId)
  writeRecents([{ id: templateId, openedAt: now }, ...without])
}

export function removeStudioRecent(templateId: string) {
  writeRecents(readRecents().filter((e) => e.id !== templateId))
}

export function getStudioRecentEntries(): StudioRecentEntry[] {
  return readRecents()
}
