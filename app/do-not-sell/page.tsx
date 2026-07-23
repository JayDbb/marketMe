import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'Do Not Sell or Share My Personal Information',
  description:
    'Marketme does not sell personal information. Learn how to exercise privacy choices.',
  path: '/do-not-sell',
})

export const dynamic = 'force-static'

export default function DoNotSellPage() {
  return (
    <LegalDocument
      title="Do Not Sell or Share"
      description="Privacy choices for California residents and anyone who wants clarity on sale/share of personal information."
      intro={`${legalCompany.tradingName} does not sell personal information for money. We also do not share personal information for cross-context behavioural advertising in the sense used by the California Consumer Privacy Act (CCPA/CPRA), except if we later enable advertising cookies/pixels that require such disclosure — in which case this page and our cookie controls will be updated.`}
      relatedLinks={[
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/cookies', label: 'Cookie Policy' },
      ]}
      sections={[
        {
          id: 'statement',
          title: 'Our current practice',
          bullets: [
            'No sale of personal information.',
            'Service providers process data only to run Marketme (hosting, auth, AI generation, email, payments when enabled).',
            'Non-essential analytics/marketing cookies are off until you consent where required.',
          ],
        },
        {
          id: 'rights',
          title: 'How to make a request',
          paragraphs: [
            `Email ${legalCompany.privacyEmail} with the subject “Do Not Sell or Share Request” and include the email on your Marketme account. We may need to verify your identity before responding.`,
            'You may also use browser Global Privacy Control (GPC) signals where we detect and honour them for applicable opt-outs.',
          ],
        },
        {
          id: 'jamaica',
          title: 'Jamaica data rights',
          paragraphs: [
            `If you are in Jamaica, your primary rights and complaint route are described in our Privacy Policy, including contact with the ${legalCompany.oicName}. This page is an additional transparency notice for “sale/share” style requests used in some other regions.`,
          ],
        },
      ]}
    />
  )
}
