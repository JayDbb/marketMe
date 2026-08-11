/**
 * Canonical SMB industry taxonomy for onboarding, settings, and analytics.
 * Labels are stored on business_profiles.industry.
 */

export const SMB_INDUSTRIES = [
  'Barber & Salon',
  'Beauty',
  'Food & Beverage',
  'Fashion',
  'Retail',
  'Fitness',
  'Health & Wellness',
  'Events',
  'Professional Services',
  'Tech',
  'Sports',
  'Interior',
  'Education',
  'Home Services',
  'Other',
] as const

export type SmbIndustry = (typeof SMB_INDUSTRIES)[number]

export const OTHER_INDUSTRY: SmbIndustry = 'Other'

export function isSmbIndustry(value: string | null | undefined): value is SmbIndustry {
  return Boolean(value && (SMB_INDUSTRIES as readonly string[]).includes(value))
}

/** Normalize free-text / legacy values onto the taxonomy when possible. */
export function normalizeIndustry(value: string | null | undefined): SmbIndustry | '' {
  if (!value?.trim()) return ''
  const trimmed = value.trim()
  if (isSmbIndustry(trimmed)) return trimmed

  const key = trimmed.toLowerCase()
  if (/barber|salon|grooming|hair/.test(key)) return 'Barber & Salon'
  if (/beauty|spa|nails|makeup/.test(key)) return 'Beauty'
  if (/food|beverage|restaurant|cafe|coffee|bakery/.test(key)) return 'Food & Beverage'
  if (/fashion|apparel|clothing/.test(key)) return 'Fashion'
  if (/retail|shop|store|ecommerce/.test(key)) return 'Retail'
  if (/fitness|gym|crossfit|yoga/.test(key)) return 'Fitness'
  if (/health|wellness|clinic|dental/.test(key)) return 'Health & Wellness'
  if (/event|wedding|party/.test(key)) return 'Events'
  if (/consult|lawyer|account|agency|professional/.test(key)) return 'Professional Services'
  if (/tech|saas|software|it\b/.test(key)) return 'Tech'
  if (/sport|athlet/.test(key)) return 'Sports'
  if (/interior|design|furniture|decor/.test(key)) return 'Interior'
  if (/educat|school|tutor|course/.test(key)) return 'Education'
  if (/home\s*service|plumb|electr|clean|hvac|lawn/.test(key)) return 'Home Services'
  return 'Other'
}
