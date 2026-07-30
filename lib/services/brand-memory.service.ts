import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'

const MAX_NOTE_LINES = 12
const MAX_NOTE_CHARS = 2500
const DEFAULT_APPROVED_CAPTIONS = 5
const REVISE_EXAMPLES = 3

export type BrandMemoryContext = {
  businessProfileId: string | null
  styleNotes: string | null
  preferredCtas: string | null
  avoidPhrases: string | null
  recentApprovedCaptions: string[]
}

function mergeNoteLines(existing: string | null | undefined, newLine: string): string {
  const cleaned = newLine
    .trim()
    .replace(/^[-•*]\s*/, '')
    .replace(/\s+/g, ' ')
    .slice(0, 280)
  if (!cleaned) return (existing ?? '').trim()

  const lines = (existing ?? '')
    .split('\n')
    .map((l) => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean)

  const filtered = lines.filter((l) => l.toLowerCase() !== cleaned.toLowerCase())
  filtered.push(cleaned)

  return filtered
    .slice(-MAX_NOTE_LINES)
    .map((l) => `- ${l}`)
    .join('\n')
    .slice(0, MAX_NOTE_CHARS)
}

function truncateCaption(content: string, max = 420): string {
  const text = content.replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

function shortDiff(original: string, final: string, max = 200): string | null {
  const a = original.trim()
  const b = final.trim()
  if (!a || !b || a === b) return null
  const from = truncateCaption(a, max)
  const to = truncateCaption(b, max)
  return `Edited: "${from}" → "${to}"`
}

export async function getBrandMemoryContext(
  userId: string,
  businessProfileId?: string | null
): Promise<BrandMemoryContext> {
  const empty: BrandMemoryContext = {
    businessProfileId: businessProfileId ?? null,
    styleNotes: null,
    preferredCtas: null,
    avoidPhrases: null,
    recentApprovedCaptions: [],
  }

  let profileId = businessProfileId ?? null

  if (!profileId) {
    const { data: profile, error } = await supabaseAdmin
      .from('business_profiles')
      .select('id, style_notes, preferred_ctas, avoid_phrases')
      .eq('user_id', userId)
      .maybeSingle()

    const captions = await fetchRecentApprovedCaptions(userId, DEFAULT_APPROVED_CAPTIONS)

    if (error || !profile) {
      // Columns may be missing before migration 026 — still use approved captions.
      const { data: fallback } = await supabaseAdmin
        .from('business_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      return {
        ...empty,
        businessProfileId: (fallback?.id as string | undefined) ?? null,
        recentApprovedCaptions: captions,
      }
    }

    profileId = profile.id as string
    return {
      businessProfileId: profileId,
      styleNotes: (profile.style_notes as string | null) ?? null,
      preferredCtas: (profile.preferred_ctas as string | null) ?? null,
      avoidPhrases: (profile.avoid_phrases as string | null) ?? null,
      recentApprovedCaptions: captions,
    }
  }

  const [{ data: profile, error }, captions] = await Promise.all([
    supabaseAdmin
      .from('business_profiles')
      .select('id, style_notes, preferred_ctas, avoid_phrases')
      .eq('id', profileId)
      .eq('user_id', userId)
      .maybeSingle(),
    fetchRecentApprovedCaptions(userId, DEFAULT_APPROVED_CAPTIONS),
  ])

  if (error || !profile) {
    return { ...empty, businessProfileId: profileId, recentApprovedCaptions: captions }
  }

  return {
    businessProfileId: profile.id as string,
    styleNotes: (profile.style_notes as string | null) ?? null,
    preferredCtas: (profile.preferred_ctas as string | null) ?? null,
    avoidPhrases: (profile.avoid_phrases as string | null) ?? null,
    recentApprovedCaptions: captions,
  }
}

async function fetchRecentApprovedCaptions(
  userId: string,
  limit: number
): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('posts')
    .select('content, approved_at, updated_at, status')
    .eq('user_id', userId)
    .in('status', ['approved', 'scheduled', 'published'])
    .not('content', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(limit)

  const captions = (data ?? [])
    .map((row) => (typeof row.content === 'string' ? row.content.trim() : ''))
    .filter(Boolean)
    .map((c) => truncateCaption(c))

  return captions
}

/**
 * Formats brand memory for system / additional_instructions prompts.
 * @param maxExamples — use 3 for revise, 5 for generate (default).
 */
export function formatBrandMemoryPromptBlock(
  ctx: BrandMemoryContext,
  options?: { maxExamples?: number }
): string {
  const maxExamples = options?.maxExamples ?? DEFAULT_APPROVED_CAPTIONS
  const parts: string[] = []

  if (ctx.styleNotes?.trim()) {
    parts.push(`User preferences (from past edits):\n${ctx.styleNotes.trim()}`)
  }
  if (ctx.preferredCtas?.trim()) {
    parts.push(`Preferred CTAs:\n${ctx.preferredCtas.trim()}`)
  }
  if (ctx.avoidPhrases?.trim()) {
    parts.push(`Avoid:\n${ctx.avoidPhrases.trim()}`)
  }

  const examples = ctx.recentApprovedCaptions.slice(0, maxExamples)
  if (examples.length > 0) {
    parts.push(
      `Recent approved posts (match this voice):\n${examples
        .map((c, i) => `${i + 1}. ${c}`)
        .join('\n')}`
    )
  }

  if (parts.length === 0) return ''
  return `\n\nBrand memory (stay consistent with this):\n${parts.join('\n\n')}`
}

export async function appendStyleNote(
  businessProfileId: string,
  note: string
): Promise<void> {
  const { data } = await supabaseAdmin
    .from('business_profiles')
    .select('style_notes')
    .eq('id', businessProfileId)
    .maybeSingle()

  if (!data) return

  const next = mergeNoteLines(data.style_notes as string | null, note)
  if (next === ((data.style_notes as string | null) ?? '').trim()) return

  await supabaseAdmin
    .from('business_profiles')
    .update({ style_notes: next })
    .eq('id', businessProfileId)
}

export async function appendAvoidPhrase(
  businessProfileId: string,
  phrase: string
): Promise<void> {
  const { data } = await supabaseAdmin
    .from('business_profiles')
    .select('avoid_phrases')
    .eq('id', businessProfileId)
    .maybeSingle()

  if (!data) return

  const next = mergeNoteLines(data.avoid_phrases as string | null, phrase)
  await supabaseAdmin
    .from('business_profiles')
    .update({ avoid_phrases: next })
    .eq('id', businessProfileId)
}

export async function appendPreferredCta(
  businessProfileId: string,
  cta: string
): Promise<void> {
  const { data } = await supabaseAdmin
    .from('business_profiles')
    .select('preferred_ctas')
    .eq('id', businessProfileId)
    .maybeSingle()

  if (!data) return

  const next = mergeNoteLines(data.preferred_ctas as string | null, cta)
  await supabaseAdmin
    .from('business_profiles')
    .update({ preferred_ctas: next })
    .eq('id', businessProfileId)
}

/** Persist a revise instruction (+ optional original→final diff). */
export async function recordReviseSignal(options: {
  userId: string
  businessProfileId?: string | null
  instruction: string
  originalCaption?: string
  revisedCaption?: string
}): Promise<void> {
  const profileId =
    options.businessProfileId ??
    (await resolveProfileId(options.userId))
  if (!profileId) return

  const instruction = options.instruction.trim()
  if (instruction) {
    await appendStyleNote(profileId, `Prefer: ${instruction}`)
  }

  const diff = shortDiff(
    options.originalCaption ?? '',
    options.revisedCaption ?? ''
  )
  if (diff) {
    await appendStyleNote(profileId, diff)
  }
}

/** On approve: keep a light note if caption looks CTA-heavy; posts table is the main voice source. */
export async function recordApprovalSignal(options: {
  userId: string
  businessProfileId?: string | null
  finalCaption: string
}): Promise<void> {
  const caption = options.finalCaption.trim()
  if (!caption) return

  const profileId =
    options.businessProfileId ??
    (await resolveProfileId(options.userId))
  if (!profileId) return

  const ctaMatch = caption.match(
    /\b(shop now|book now|learn more|sign up|get yours|dm us|link in bio|visit us|call us)\b/i
  )
  if (ctaMatch) {
    await appendPreferredCta(profileId, ctaMatch[0])
  }
}

export async function recordRejectFeedback(options: {
  userId: string
  businessProfileId?: string | null
  feedback?: string | null
  caption?: string | null
}): Promise<void> {
  const profileId =
    options.businessProfileId ??
    (await resolveProfileId(options.userId))
  if (!profileId) return

  const feedback = options.feedback?.trim()
  if (feedback) {
    await appendAvoidPhrase(profileId, feedback)
    await appendStyleNote(profileId, `Reject feedback: ${feedback}`)
    return
  }

  if (options.caption?.trim()) {
    await appendStyleNote(
      profileId,
      `Rejected a caption like: ${truncateCaption(options.caption, 160)}`
    )
  }
}

async function resolveProfileId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('business_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return (data?.id as string | undefined) ?? null
}

export { REVISE_EXAMPLES }
