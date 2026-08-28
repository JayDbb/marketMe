import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { HelpCenterContent } from '@/components/marketing/help-center-content'
import { createPageMetadata } from '@/lib/metadata'
import { getAllHelpArticles } from '@/lib/help-articles'

export const metadata = createPageMetadata({
  title: 'Help Center',
  description:
    'Get help with Marketme — Generate, Studio, Calendar, connections, credits, billing, and account support.',
  path: '/help',
})

export const dynamic = 'force-static'

const topics = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Sign up with Google or email and password. On login, use Google, a magic link, or your password. After signup you can complete onboarding and open the dashboard.',
        href: '/signup',
        linkLabel: 'Sign up',
      },
      {
        q: 'What should I do first?',
        a: 'Connect a social account (OAuth), generate a small batch of drafts, review them, then place approved posts on Calendar.',
        href: '/help/first-week-loop',
        linkLabel: 'First week guide',
      },
    ],
  },
  {
    title: 'Generate, Studio & Calendar',
    items: [
      {
        q: 'Does AI publish without me?',
        a: 'No. Generation creates drafts for you to review. Schedule only what you approve — that is intentional for brand safety and advertising honesty.',
      },
      {
        q: 'How do credits work?',
        a: 'Free accounts start with a monthly AI credit allowance. Generation spends credits; editing and scheduling existing drafts still works when you hit the limit.',
        href: '/help/credits-and-generation',
        linkLabel: 'Credits guide',
      },
    ],
  },
  {
    title: 'Connections & billing',
    items: [
      {
        q: 'Why did Instagram connect fail?',
        a: 'You need an Instagram Business or Creator account. On the Facebook Login path, that account must be linked to a Facebook Page you admin.',
        href: '/help/connect-instagram',
        linkLabel: 'Connect Instagram guide',
      },
      {
        q: 'Can I cancel a paid plan?',
        a: 'Yes. Cancel before renewal to stop future charges. Access continues through the period you already paid for. See Refunds & Billing for details.',
        href: '/refunds',
        linkLabel: 'Refunds & Billing',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <MarketingPageShell>
      <HelpCenterContent topics={topics} articles={getAllHelpArticles()} />
    </MarketingPageShell>
  )
}
