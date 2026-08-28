import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { ChangelogContent } from '@/components/marketing/changelog-content'
import { createPageMetadata } from '@/lib/metadata'
import { getChangelogEntries } from '@/lib/changelog-entries'

export const metadata = createPageMetadata({
  title: 'Changelog',
  description:
    'What shipped in Marketme — features, fixes, legal updates, and platform improvements, newest first.',
  path: '/changelog',
})

export const dynamic = 'force-static'

export default function ChangelogPage() {
  return (
    <MarketingPageShell>
      <ChangelogContent entries={getChangelogEntries()} />
    </MarketingPageShell>
  )
}
