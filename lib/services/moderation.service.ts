import { supabaseAdmin } from '@/lib/supabase/admin'
import type {
  ModerationFlag,
  ModerationFlagType,
  ModerationSeverity,
} from '@/types/pipeline'

export type ModerationResult = {
  passed: boolean
  flags: ModerationFlag[]
  blockingMessages: string[]
}

type PostForModeration = {
  id: string
  user_id: string
  content: string | null
  image_url: string | null
}

/** Patterns that block approval regardless of business type (spec: no unverifiable claims). */
const BLOCKING_CLAIM_PATTERNS: RegExp[] = [
  /\bguaranteed?\s+(cure|results?|income|returns?)\b/i,
  /\b(cure|treat|heal)\s+(cancer|diabetes|covid|disease)\b/i,
  /\b(get rich|financial freedom|passive income)\s+(fast|quick|guaranteed)\b/i,
  /\bwe\s+are\s+licensed\s+(doctors?|lawyers?|attorneys?)\b/i,
  /\b(FDA|SEC)\s+approved\b/i,
]

const WARNING_PATTERNS: { pattern: RegExp; type: ModerationFlagType; message: string }[] = [
  {
    pattern: /\b(best|#1|number one|leading)\b/i,
    type: 'claim',
    message: 'Superlative claim detected — verify before publishing.',
  },
  {
    pattern: /\b(free|100% off|no risk)\b/i,
    type: 'claim',
    message: 'Promotional claim detected — ensure terms are accurate.',
  },
]

/**
 * Stub moderation layer. Runs rule-based checks until AI moderation providers are wired.
 * Always logs results to moderation_flags for audit.
 */
export async function moderatePost(post: PostForModeration): Promise<ModerationResult> {
  const flags: ModerationFlag[] = []
  const blockingMessages: string[] = []
  const caption = post.content?.trim() ?? ''

  if (!caption) {
    await recordFlag(post, 'caption', 'block', 'Post caption is empty.')
    return {
      passed: false,
      flags: [],
      blockingMessages: ['Post caption is empty.'],
    }
  }

  for (const pattern of BLOCKING_CLAIM_PATTERNS) {
    if (pattern.test(caption)) {
      const message = 'Caption contains a restricted health, financial, or legal claim.'
      blockingMessages.push(message)
      const flag = await recordFlag(post, 'claim', 'block', message)
      flags.push(flag)
    }
  }

  for (const rule of WARNING_PATTERNS) {
    if (rule.pattern.test(caption)) {
      const flag = await recordFlag(post, rule.type, 'warning', rule.message)
      flags.push(flag)
    }
  }

  const passed = blockingMessages.length === 0
  return { passed, flags, blockingMessages }
}

async function recordFlag(
  post: PostForModeration,
  flagType: ModerationFlagType,
  severity: ModerationSeverity,
  message: string
): Promise<ModerationFlag> {
  const { data, error } = await supabaseAdmin
    .from('moderation_flags')
    .insert({
      post_id: post.id,
      user_id: post.user_id,
      flag_type: flagType,
      severity,
      message,
      reviewed: severity !== 'block',
      reviewed_at: severity !== 'block' ? new Date().toISOString() : null,
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(`Failed to record moderation flag: ${error?.message ?? 'unknown'}`)
  }

  return data as ModerationFlag
}
