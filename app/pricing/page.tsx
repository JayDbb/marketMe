import { PricingPageContent } from '@/components/marketing/pricing-page-content'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Pricing',
  description:
    'Marketme Free, Pro, and Team plans with real limits for AI credits, posts, profiles, and workspaces.',
  path: '/pricing',
})

export const dynamic = 'force-static'

export default function PricingPage() {
  return (
    <MarketingPageShell mainClassName="pb-0">
      <PricingPageContent />
    </MarketingPageShell>
  )
}
