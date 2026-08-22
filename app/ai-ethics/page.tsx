import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'AI Transparency & Ethics',
  description:
    'How Marketme uses AI, what users should disclose, and our human-review expectations.',
  path: '/ai-ethics',
})

export const dynamic = 'force-static'

export default function AiEthicsPage() {
  return (
    <LegalDocument
      title="AI Transparency & Ethics"
      description="How we use AI in Marketme and what we expect from customers who publish AI-assisted marketing."
      intro={`${legalCompany.tradingName} uses AI to help draft marketing strategies, captions, and creative briefs. We believe AI should assist humans — not replace accountability. This page explains our approach.`}
      relatedLinks={[
        { href: '/terms', label: 'Terms of Service' },
        { href: '/acceptable-use', label: 'Acceptable Use' },
        { href: '/privacy', label: 'Privacy Policy' },
      ]}
      sections={[
        {
          id: 'how',
          title: 'How AI is used',
          bullets: [
            'Generate draft marketing strategies and post ideas from your business profile.',
            'Suggest captions, hashtags, and image prompts.',
            'Assist studio/design workflows with suggested text or layouts.',
            'Support internal product features such as assistants or recommendations.',
          ],
        },
        {
          id: 'not',
          title: 'What AI is not',
          bullets: [
            'Not a guarantee of sales, reach, or ranking.',
            'Not a substitute for legal, medical, financial, or professional advice.',
            'Not automatically accurate, unique, or free of third-party similarity.',
            'Not permission to publish misleading or unlawful ads.',
          ],
        },
        {
          id: 'human',
          title: 'Human review',
          paragraphs: [
            'Before scheduling or publishing, you should edit and approve content. Our product flows are designed so generation is a draft step — publishing should reflect a human decision.',
          ],
        },
        {
          id: 'disclosure',
          title: 'Disclosures for your audience',
          paragraphs: [
            'Depending on where your audience is and what you publish, you may need to disclose paid partnerships and, in some cases, AI involvement — especially for ads, endorsements, or synthetic media. Jamaica’s Fair Competition Act requires advertising that is not misleading. Other markets (for example US FTC endorsement principles or EU AI transparency rules) may impose additional disclosure duties. You are responsible for applying the rules that apply to your campaigns.',
          ],
        },
        {
          id: 'data',
          title: 'Your data and models',
          paragraphs: [
            'Prompts and business context you provide may be sent to AI providers listed in our Privacy Policy to generate outputs. We do not sell your content. We aim to use providers under contracts that restrict misuse; check that policy for current subprocessors.',
          ],
        },
        {
          id: 'safety',
          title: 'Safety limits',
          paragraphs: [
            'We may use automated or manual checks to reduce clearly abusive content, but you remain responsible for final outputs. Report concerns to our support or legal contacts.',
          ],
          note: `Contact: ${legalCompany.supportEmail}`,
        },
      ]}
    />
  )
}
