import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'Refunds & Billing',
  description:
    'Marketme pricing disclosures, auto-renewal, cancellation, and refund policy.',
  path: '/refunds',
})

export const dynamic = 'force-static'

export default function RefundsPage() {
  return (
    <LegalDocument
      title="Refunds & Billing"
      description="Material billing terms disclosed before purchase, consistent with Jamaican consumer and fair-trading expectations."
      intro={`Clear pricing and refund information must be available before you pay. This policy explains how ${legalCompany.tradingName} handles plans, renewals, cancellations, and refunds when paid billing is enabled.`}
      relatedLinks={[
        { href: '/pricing', label: 'Pricing' },
        { href: '/terms', label: 'Terms of Service' },
      ]}
      sections={[
        {
          id: 'pricing',
          title: 'Pricing disclosure',
          paragraphs: [
            'Plan names, feature summaries, and fees are shown on the Pricing page and again at checkout before payment. Taxes, currency, and billing period (monthly/annual) will be shown before you confirm.',
            `Merchant: ${legalCompany.legalEntityName}, ${legalCompany.address}, ${legalCompany.country}. Support: ${legalCompany.supportEmail}.`,
          ],
        },
        {
          id: 'renewal',
          title: 'Auto-renewal',
          paragraphs: [
            'Paid subscriptions renew automatically at the end of each billing period until cancelled. By confirming purchase you authorise recurring charges to your payment method for the selected plan.',
          ],
        },
        {
          id: 'cancel',
          title: 'Cancellation',
          paragraphs: [
            'You may cancel a subscription from account/billing settings (when available) or by emailing support before the next renewal. Cancellation stops future renewals; you generally keep access until the end of the paid period already charged.',
          ],
        },
        {
          id: 'refunds',
          title: 'Refunds',
          bullets: [
            'Unless required by law or expressly stated in a promotion, subscription fees are non-refundable once a billing period has started.',
            'If a charge was made in error, contact support within 14 days with your account email and receipt details.',
            'We may issue goodwill refunds or credits at our discretion for service outages or billing mistakes.',
            'Payment-provider disputes may delay resolution; contacting us first usually helps.',
          ],
        },
        {
          id: 'changes-price',
          title: 'Price changes',
          paragraphs: [
            'We may change plan prices with notice. Changes apply to subsequent renewal periods unless otherwise stated.',
          ],
        },
        {
          id: 'free',
          title: 'Free plans and trials',
          paragraphs: [
            'Free tiers or trials, if offered, may be limited, changed, or withdrawn. Converting to a paid plan requires an affirmative checkout step with price disclosure.',
          ],
          note: `Billing questions: ${legalCompany.supportEmail}`,
        },
      ]}
    />
  )
}
