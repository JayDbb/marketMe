export type HelpArticle = {
  slug: string
  title: string
  description: string
  category: string
  updated: string
  body: string[]
  steps?: string[]
}

export const helpArticles: HelpArticle[] = [
  {
    slug: 'connect-instagram',
    title: 'Connect Instagram the right way',
    description:
      'Convert to a Business or Creator account, link a Facebook Page if needed, and complete Meta OAuth.',
    category: 'Connections',
    updated: '24 August 2026',
    body: [
      'Marketme connects Instagram through Meta’s official OAuth flow. Personal profiles cannot publish via the API — you need a Business or Creator account.',
      'If your connect flow uses Facebook Login, that Instagram account must also be linked to a Facebook Page you admin, and you should be logged into that Facebook account in the browser.',
    ],
    steps: [
      'On Instagram, open Settings → Account type and tools → Switch to professional account → Business or Creator.',
      'If prompted (Facebook Login path), link the Instagram account to a Facebook Page you fully admin.',
      'In Marketme, open Connections and choose Connect Instagram.',
      'Approve the Meta permissions screen, then return to Marketme and confirm the connection shows as connected.',
      'If OAuth fails, use an Incognito window signed into the correct Facebook/Instagram account and try again.',
    ],
  },
  {
    slug: 'credits-and-generation',
    title: 'How AI credits work',
    description: 'Free starts with a monthly credit allowance. Generation spends credits; you still approve every draft.',
    category: 'Billing',
    updated: '24 August 2026',
    body: [
      'New Free accounts receive 50 AI credits for the billing period when their subscription row is created (usually on first dashboard or Generate visit).',
      'Credits reset at the start of each month for your plan allowance. Hitting the limit pauses new generation until reset or upgrade — you can still edit and schedule existing drafts.',
      'Generation is assistive: Marketme drafts, you review, then you schedule or publish.',
    ],
  },
  {
    slug: 'first-week-loop',
    title: 'Your first weekly content loop',
    description: 'Connect → generate a small batch → review → place on Calendar.',
    category: 'Getting started',
    updated: '24 August 2026',
    body: [
      'Marketme is built for a weekly shipping habit, not autopilot publishing.',
      'Complete onboarding with your business brief so drafts match your brand voice. Then connect Instagram, generate a modest batch, approve what you like, and drop posts onto the calendar.',
    ],
    steps: [
      'Finish the onboarding brief (business, focus, brand assets).',
      'Connect Instagram from Connections.',
      'Generate a small set of drafts (watch your credit cost).',
      'Review captions and creatives in Generate / Studio.',
      'Schedule approved posts on Calendar.',
    ],
  },
]

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return helpArticles.find((a) => a.slug === slug)
}

export function getAllHelpArticles(): HelpArticle[] {
  return helpArticles
}
