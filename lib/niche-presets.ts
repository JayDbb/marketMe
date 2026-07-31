/**
 * Niche presets for first-run quality.
 * Product stays multi-niche; barbers/salons get stronger defaults.
 */

export type NichePresetId = 'barber_salon'

export type NichePreset = {
  id: NichePresetId
  label: string
  industryOptions: string[]
  defaultIndustry: string
  servicesExample: string
  primaryGoal: string
  targetCustomers: string
  tone: string
  channels: string[]
  contentPillars: string[]
  hashtagSeeds: string[]
  trendHooks: string[]
  postingWindows: Array<{ day?: string; localTime?: string; reason?: string }>
  locationExample: string
  businessNameExample: string
}

export const BARBER_SALON_PRESET: NichePreset = {
  id: 'barber_salon',
  label: 'I’m a barber or salon',
  industryOptions: ['Barber', 'Salon', 'Barber & Salon'],
  defaultIndustry: 'Barber & Salon',
  servicesExample:
    'Premium cuts, fades, beard trims, and grooming — walk-ins and appointments welcome.',
  primaryGoal: 'Bookings / Consultations',
  targetCustomers: 'Men and women ages 18–40 who want a reliable, polished look',
  tone: 'Friendly & warm',
  channels: ['Instagram'],
  contentPillars: [
    'Haircuts & styles',
    'Before / After transformations',
    'Customer testimonials',
    'Grooming tips',
    'Promotions & booking CTAs',
  ],
  hashtagSeeds: [
    'barbershop',
    'mensgrooming',
    'fade',
    'salonlife',
    'haircut',
    'beardtrim',
    'booknow',
    'localbarber',
  ],
  trendHooks: [
    'Before/after Reels',
    'Quick grooming tip under 15s',
    'Client shout-out / testimonial',
    'Weekend booking reminder',
  ],
  postingWindows: [
    { day: 'Tue–Thu', localTime: '12:00', reason: 'Midday scroll / lunch break' },
    { day: 'Fri', localTime: '17:00', reason: 'Weekend booking window' },
    { day: 'Sun', localTime: '18:00', reason: 'Week planning / self-care' },
  ],
  locationExample: 'Kingston, Jamaica',
  businessNameExample: 'e.g. Fade Room Kingston',
}

export function isBarberSalonIndustry(industry?: string | null): boolean {
  const key = (industry || '').toLowerCase()
  return /barber|salon|grooming|hair\s*cut|hairdresser|beauty\s*salon/.test(key)
}

export function getNichePresetForIndustry(
  industry?: string | null
): NichePreset | null {
  if (isBarberSalonIndustry(industry)) return BARBER_SALON_PRESET
  return null
}

/** Parse free-text competitor lines into handles / URLs. */
export function parseCompetitorLines(raw: string): Array<{
  label: string
  instagramHandle: string | null
  websiteUrl: string | null
}> {
  const lines = raw
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 5)

  return lines.map((line) => {
    const asUrl = /^https?:\/\//i.test(line)
      ? line
      : line.includes('.') && !line.startsWith('@') && !line.includes(' ')
        ? `https://${line}`
        : null

    if (asUrl || /^https?:\/\//i.test(line) || (line.includes('.') && !line.startsWith('@'))) {
      const websiteUrl = asUrl || (line.startsWith('http') ? line : `https://${line}`)
      let host = websiteUrl
      try {
        host = new URL(websiteUrl).hostname.replace(/^www\./, '')
      } catch {
        /* keep raw */
      }
      return { label: host, instagramHandle: null, websiteUrl }
    }

    const handle = line.replace(/^@/, '').replace(/^instagram\.com\//i, '').split(/[/?#]/)[0]
    return {
      label: `@${handle}`,
      instagramHandle: handle || null,
      websiteUrl: null,
    }
  })
}
