/**
 * Public company / controller details for legal pages.
 * Override via env so Jamaica registration details can be filled without code changes.
 */
export const legalCompany = {
  tradingName: 'Marketme',
  legalEntityName:
    process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME?.trim() || 'Marketme',
  country: 'Jamaica',
  address:
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() ||
    'Kingston, Jamaica (update with your registered office address)',
  registrationNumber:
    process.env.NEXT_PUBLIC_COMPANY_REGISTRATION?.trim() || null,
  legalEmail:
    process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || 'legal@marketme.app',
  privacyEmail:
    process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || 'privacy@marketme.app',
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@marketme.app',
  governingLaw: 'the laws of Jamaica',
  disputeVenue: 'the courts of Jamaica',
  oicName: 'Office of the Information Commissioner (Jamaica)',
  oicUrl: 'https://www.oic.gov.jm',
  lastUpdated: '21 July 2026',
  /** Vendors that may process personal data (cross-border). */
  subprocessors: [
    { name: 'Vercel', purpose: 'Hosting and edge delivery', region: 'United States / global' },
    { name: 'Supabase', purpose: 'Database and file storage', region: 'United States / configured region' },
    { name: 'Better Auth / Google', purpose: 'Authentication and Google sign-in', region: 'United States / global' },
    { name: 'OpenAI / OpenRouter / MarketMe AI API', purpose: 'AI content generation', region: 'United States / configured region' },
    { name: 'Stripe', purpose: 'Payment processing (when billing is enabled)', region: 'United States / global' },
    { name: 'Resend', purpose: 'Transactional email (magic links, notices)', region: 'United States / global' },
    { name: 'Trigger.dev', purpose: 'Background jobs', region: 'United States / global' },
    { name: 'Pexels', purpose: 'Stock imagery (when used in Studio)', region: 'United States / global' },
  ],
} as const
