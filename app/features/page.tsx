import { FeaturesPageContent } from '@/components/marketing/features-page-content'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Features',
  description:
    'Explore Marketme capabilities: AI Generate, Design Studio, content calendar, inbox, social connections, and the dashboard assistant.',
  path: '/features',
})

export const dynamic = 'force-static'

export default function FeaturesPage() {
  return (
    <MarketingPageShell mainClassName="pb-0">
      <FeaturesPageContent />
    </MarketingPageShell>
  )
}
