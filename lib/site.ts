export const siteConfig = {
  name: 'Marketme',
  title: 'Marketme | Your AI Marketing Manager',
  description:
    'Generate AI drafts, design in Studio, and schedule across connected social accounts — with a human review before anything goes live.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'en_US',
  twitterHandle: '@marketme',
} as const

export const marketingRoutes = [
  '/',
  '/features',
  '/pricing',
  '/blog',
  '/about',
  '/changelog',
  '/help',
  '/privacy',
  '/terms',
  '/cookies',
  '/acceptable-use',
  '/ai-ethics',
  '/do-not-sell',
  '/refunds',
  '/login',
  '/signup',
] as const
