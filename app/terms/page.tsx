import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'Terms of Service',
  description:
    'Terms governing use of Marketme, including AI content responsibility, billing, and Jamaica governing law.',
  path: '/terms',
})

export const dynamic = 'force-static'

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      description="The agreement between you and Marketme for use of our website and product."
      intro={`By creating an account or using ${legalCompany.tradingName}, you agree to these Terms. Please read them with our Privacy Policy, Acceptable Use Policy, Refund Policy, and AI Transparency page. If you do not agree, do not use the service.`}
      relatedLinks={[
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/acceptable-use', label: 'Acceptable Use' },
        { href: '/refunds', label: 'Refunds & Billing' },
        { href: '/ai-ethics', label: 'AI Transparency' },
      ]}
      sections={[
        {
          id: 'service',
          title: 'The service',
          paragraphs: [
            'Marketme provides software tools to help businesses plan, generate, schedule, and manage marketing content. Features may include AI-assisted copy and creatives, calendars, studio tools, analytics, and optional social publishing integrations. Features may change, be beta, or depend on third-party platforms and API availability.',
          ],
        },
        {
          id: 'eligibility',
          title: 'Eligibility and accounts',
          bullets: [
            'You must be at least 18 and able to form a binding contract.',
            'You must provide accurate account information and keep credentials secure.',
            'You are responsible for activity under your account.',
            'We may suspend or terminate accounts that violate these Terms or our Acceptable Use Policy.',
          ],
        },
        {
          id: 'merchant',
          title: 'Merchant information (Electronic Transactions disclosures)',
          paragraphs: [
            `Provider: ${legalCompany.legalEntityName} trading as ${legalCompany.tradingName}.`,
            `Address: ${legalCompany.address}, ${legalCompany.country}.`,
            `Contact: ${legalCompany.supportEmail} (support), ${legalCompany.legalEmail} (legal).`,
            legalCompany.registrationNumber
              ? `Registration: ${legalCompany.registrationNumber}.`
              : 'Company registration details will be published on this page and in checkout once available.',
          ],
        },
        {
          id: 'content',
          title: 'Your content and licence',
          paragraphs: [
            'You retain ownership of content you upload or create in Marketme (“Customer Content”), including business information and posts you approve.',
            'You grant us a limited licence to host, process, transmit, and display Customer Content solely to provide and secure the service. We do not claim ownership of your marketing content.',
            'You represent that you have all rights needed to submit Customer Content and to publish it to connected platforms.',
          ],
        },
        {
          id: 'ai',
          title: 'AI-generated outputs',
          paragraphs: [
            'Marketme may use artificial intelligence systems to suggest captions, strategies, images, or other materials (“AI Outputs”). AI Outputs can be inaccurate, incomplete, biased, or similar to third-party material.',
            'You are solely responsible for reviewing, editing, and approving AI Outputs before publishing or relying on them. You are responsible for advertising claims, disclosures, intellectual property clearance, privacy, platform rules, and all legal compliance of content you publish.',
            'Unless we expressly agree otherwise in writing, we do not guarantee uniqueness, accuracy, fitness for a particular purpose, or non-infringement of AI Outputs.',
          ],
        },
        {
          id: 'platforms',
          title: 'Third-party platforms',
          paragraphs: [
            'If you connect Instagram, Meta, or other networks, you must comply with their terms, policies, and API rules. We only access platforms through authorised OAuth/API flows you approve. We do not ask for your social passwords.',
            'Platform outages, policy changes, rate limits, or account actions by third parties are outside our control.',
          ],
        },
        {
          id: 'billing',
          title: 'Plans, billing, and renewals',
          paragraphs: [
            'Paid plans, if offered, are described on the Pricing page and at checkout. Fees, taxes, billing periods, and auto-renewal terms will be disclosed before you pay. See our Refunds & Billing policy for cancellations and refunds.',
          ],
        },
        {
          id: 'aup',
          title: 'Acceptable use',
          paragraphs: [
            'You must follow our Acceptable Use Policy. Prohibited uses include illegal advertising, scams, hate or harassment, spam, fake testimonials, impersonation, and attempts to disrupt or abuse the service or connected platforms.',
          ],
        },
        {
          id: 'ip',
          title: 'Our intellectual property',
          paragraphs: [
            'The Marketme product, branding, software, and documentation are owned by us or our licensors. Except for the limited rights needed to use the service, no licence is granted.',
          ],
        },
        {
          id: 'disclaimers',
          title: 'Disclaimers',
          paragraphs: [
            'The service is provided “as is” and “as available” to the maximum extent permitted by law. We do not warrant uninterrupted availability, error-free operation, or any particular business result, revenue, or ranking outcome from using Marketme or AI Outputs.',
            'Nothing in these Terms excludes liability that cannot be excluded under Jamaica’s Consumer Protection Act or other mandatory law.',
          ],
        },
        {
          id: 'liability',
          title: 'Limitation of liability',
          paragraphs: [
            'To the fullest extent permitted by law, Marketme will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenue, goodwill, or data, arising from your use of the service or AI Outputs.',
            'Our aggregate liability for claims relating to the service in any twelve-month period is limited to the greater of (a) the fees you paid us for the service in that period, or (b) USD $100 (or Jamaica dollar equivalent), except where mandatory law requires otherwise.',
          ],
        },
        {
          id: 'indemnity',
          title: 'Indemnity',
          paragraphs: [
            'You agree to defend and indemnify Marketme and its officers, directors, and staff against claims, damages, and expenses (including reasonable legal fees) arising from your Customer Content, your published marketing, your misuse of the service, or your violation of these Terms, law, or third-party platform rules — except to the extent caused by our wilful misconduct.',
          ],
        },
        {
          id: 'law',
          title: 'Governing law and disputes',
          paragraphs: [
            `These Terms are governed by ${legalCompany.governingLaw}, without regard to conflict-of-law rules. Courts in ${legalCompany.disputeVenue} have exclusive jurisdiction, subject to any mandatory consumer protections that cannot be waived.`,
          ],
        },
        {
          id: 'changes-terms',
          title: 'Changes',
          paragraphs: [
            'We may update these Terms. Continued use after notice of material changes constitutes acceptance, except where mandatory law requires a different process.',
          ],
        },
      ]}
    />
  )
}
