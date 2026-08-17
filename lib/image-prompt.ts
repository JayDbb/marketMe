/**
 * Shared image-prompt directives for MarketMe AI creative briefs and
 * local DALL·E / OpenRouter generation. Keep language visual and concrete —
 * image models ignore marketing slogans.
 */

export type ImagePromptBrand = {
  businessName?: string | null
  industry?: string | null
  industryDetail?: string | null
  tone?: string | null
  services?: string | null
  brandColors?: string[] | null
  brandFonts?: string[] | null
  logoUrl?: string | null
}

const INDUSTRY_SCENE: Record<string, string> = {
  'Barber & Salon':
    'Barbershop or salon interior: clean station, warm lighting, grooming tools, hair texture, no cluttered waiting room',
  Beauty:
    'Beauty still-life: skincare textures, soft studio light, product-forward, spa-clean surfaces',
  'Food & Beverage':
    'Food photography: steam, garnish, shallow depth of field, appetizing colour, natural window light',
  Fashion:
    'Editorial fashion: fabric drape, confident pose or garment still-life, magazine lighting',
  Retail:
    'Retail product hero: tidy shelf or tabletop, tactile materials, lifestyle context without messy store aisles',
  Fitness:
    'Athletic motion or gym still: sweat, muscle, training equipment, high-energy lighting',
  'Health & Wellness':
    'Calm wellness scene: natural light, plants, clean clinical-but-warm atmosphere',
  Events:
    'Event atmosphere: florals, tablescape, celebration lighting, candid energy without unreadable signage',
  'Professional Services':
    'Modern workplace: confident professional, clean desk, architectural interior, trustworthy lighting',
  Tech:
    'Clean tech product or workspace: screens as glow not UI text, cool-neutral lighting, geometric composition',
  Sports:
    'Sports action or kit still: stadium or field atmosphere, motion, team colour accents',
  Interior:
    'Interior design: styled room, materials and texture, architectural photography, natural light',
  Education:
    'Learning moment: books, workshop table, focused student or instructor, bright practical lighting',
  'Home Services':
    'Before/after craftsmanship: tools, home exterior or interior job site, skilled tradesperson, daylight',
}

export function industrySceneHint(industry?: string | null): string | null {
  const key = industry?.trim()
  if (!key) return null
  return INDUSTRY_SCENE[key] ?? `Authentic ${key.toLowerCase()} scene, real materials, no stock-photo clichés`
}

/** Constraints injected into creative-brief / image-model prompts. */
export function buildImagePromptDirectives(brand?: ImagePromptBrand | null): string {
  if (!brand) {
    return [
      'Instagram feed graphic, 1:1 square, 1080px look, high-end commercial photography.',
      'No tiny unreadable text, no watermarks, no fake logos, no UI mockups.',
    ].join(' ')
  }

  const colors = (brand.brandColors ?? []).filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c))
  const fonts = (brand.brandFonts ?? []).map((f) => f.trim()).filter(Boolean)
  const scene = industrySceneHint(brand.industry)
  const industryLabel = [brand.industry, brand.industryDetail].filter(Boolean).join(' — ')

  return [
    'Instagram feed visual, square 1:1 composition, looks like a premium 1080px social graphic.',
    brand.businessName ? `Brand: ${brand.businessName}.` : null,
    industryLabel ? `Industry: ${industryLabel}.` : null,
    scene ? `Scene: ${scene}.` : null,
    brand.tone ? `Mood matches brand voice: ${brand.tone}.` : null,
    brand.services ? `Subject should relate to: ${brand.services.slice(0, 160)}.` : null,
    colors.length > 0
      ? `Dominant palette (hex, match closely): ${colors.join(', ')}.`
      : null,
    fonts.length > 0
      ? `If any large headline appears, suggest ${fonts[0]}-like letterforms; keep text to 3–6 words max.`
      : 'Prefer photography over typography; if text appears, 3–6 words max, large and sharp.',
    brand.logoUrl
      ? 'Leave a clean corner or centre negative space for a logo overlay; do not invent a logo or brand wordmark.'
      : 'Do not invent logos, brand names, or watermarks.',
    'Photoreal or polished commercial still. No collages, no watermarks, no misspelled words, no tiny captions.',
  ]
    .filter(Boolean)
    .join(' ')
}

export function imagePromptSystemInstructions(brand?: ImagePromptBrand | null): string {
  return [
    'You write image-generation prompts for Instagram brand posts.',
    'Return only the full prompt: no quotes, markdown, or commentary.',
    'Keep under 800 characters. Be concrete (subject, setting, lighting, camera, colour).',
    buildImagePromptDirectives(brand),
  ].join('\n')
}
