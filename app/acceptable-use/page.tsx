import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'

export const metadata = createPageMetadata({
  title: 'Acceptable Use Policy',
  description:
    'Rules for using Marketme ethically and lawfully, including prohibited marketing practices.',
  path: '/acceptable-use',
})

export const dynamic = 'force-static'

export default function AcceptableUsePage() {
  return (
    <LegalDocument
      title="Acceptable Use Policy"
      description="What you may and may not do with Marketme and content you publish through it."
      intro="This Acceptable Use Policy (AUP) is part of our Terms of Service. It protects users, Marketme, and the platforms we connect to. Violations may lead to content removal, suspension, or termination."
      relatedLinks={[
        { href: '/terms', label: 'Terms of Service' },
        { href: '/ai-ethics', label: 'AI Transparency' },
      ]}
      sections={[
        {
          id: 'allowed',
          title: 'Allowed use',
          bullets: [
            'Creating and scheduling marketing content for businesses you own or are authorised to represent.',
            'Using AI suggestions as drafts that a human reviews before publishing.',
            'Connecting social accounts you control via official OAuth flows.',
          ],
        },
        {
          id: 'prohibited',
          title: 'Prohibited use',
          bullets: [
            'Illegal products/services, fraud, scams, phishing, or money-mule schemes.',
            'Hate, harassment, threats, exploitation, or content that sexualises minors.',
            'Fake reviews, fabricated testimonials, or synthetic endorsements presented as real human experiences.',
            'Misleading advertising, hidden material terms, or claims you cannot substantiate.',
            'Impersonation, deepfakes of real people without lawful authority/consent, or brand/IP infringement.',
            'Spam, bulk unsolicited messaging, engagement pods, or platform-policy evasion.',
            'Scraping, reverse engineering, probing for vulnerabilities, or interfering with the service.',
            'Uploading malware or attempting to access other users’ accounts or data.',
            'Using Marketme to violate Meta/Instagram or other platform terms, rate limits, or community standards.',
          ],
        },
        {
          id: 'ai-review',
          title: 'Human review requirement',
          paragraphs: [
            'You must review AI-generated captions, images, and strategies before publishing. You remain responsible for disclosures required by advertising law (including Jamaica’s Fair Competition Act rules against misleading advertising) and any foreign rules that apply to your audience.',
          ],
        },
        {
          id: 'enforcement',
          title: 'Enforcement',
          paragraphs: [
            'We may investigate reports, remove content, limit features, or terminate accounts. We may report illegal activity to authorities or platforms when appropriate.',
          ],
        },
      ]}
    />
  )
}
