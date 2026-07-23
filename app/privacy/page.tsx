import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description:
    'How Marketme collects, uses, shares, and protects personal data under Jamaica’s Data Protection Act framework.',
  path: '/privacy',
})

export const dynamic = 'force-static'

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      description="Transparency notice for personal data processed by Marketme as a Jamaica-based service."
      intro={`At ${legalCompany.tradingName}, we take privacy seriously. This policy explains what personal information we collect, why we use it, who we share it with (including overseas processors), how long we keep it, and how you can exercise your rights. It is drafted to support Jamaica’s Data Protection Act, 2020 standards and to inform users in other jurisdictions.`}
      relatedLinks={[
        { href: '/cookies', label: 'Cookie Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/do-not-sell', label: 'Do Not Sell or Share' },
        { href: '/ai-ethics', label: 'AI Transparency' },
      ]}
      sections={[
        {
          id: 'who',
          title: 'Who we are (data controller)',
          paragraphs: [
            `${legalCompany.legalEntityName} (“${legalCompany.tradingName}”, “we”, “us”) is the organisation responsible for personal data processed through this website and product. We are based in ${legalCompany.country}.`,
            `Contact for privacy requests: ${legalCompany.privacyEmail}. If you believe we are not complying with Jamaica’s data protection standards, you may also raise a complaint with the ${legalCompany.oicName} (${legalCompany.oicUrl}).`,
          ],
        },
        {
          id: 'scope',
          title: 'Scope',
          paragraphs: [
            'This notice covers visitors to our marketing site, people who create accounts, and people whose business or marketing information is entered into the product (for example business profiles, posts, and connected social accounts).',
          ],
        },
        {
          id: 'collect',
          title: 'What we collect',
          bullets: [
            'Account data: name, email, password (hashed), authentication session data, and Google account identifiers if you use Google sign-in.',
            'Business profile data: business name, industry, services, audience, goals, tone, channels, and related onboarding details you provide.',
            'Content data: captions, templates, studio assets, schedules, generation history, and similar product content.',
            'Usage and device data: IP address, browser/device information, approximate location derived from IP, pages viewed, and diagnostic logs needed to run and secure the service.',
            'Billing data (when payments are enabled): plan selection and payment metadata processed by our payment provider (we do not store full card numbers on our servers).',
            'Support communications: messages you send to support or legal contacts.',
          ],
        },
        {
          id: 'sources',
          title: 'How we collect data',
          bullets: [
            'Directly from you (forms, onboarding, dashboard, support).',
            'Automatically from your browser or device (cookies, logs, security signals).',
            'From identity providers (for example Google OAuth) when you choose to connect them.',
            'From social platforms you explicitly connect for publishing or insights, subject to those platforms’ terms.',
          ],
        },
        {
          id: 'purposes',
          title: 'Why we process personal data',
          bullets: [
            'Provide, maintain, and secure the Marketme service (contract / service delivery).',
            'Authenticate users and prevent abuse (security and legitimate interests / consent where required).',
            'Generate and schedule marketing content you request (service delivery).',
            'Process subscriptions and invoices when billing is enabled (contract).',
            'Send service emails such as magic links and security notices (contract / security).',
            'Send product updates or marketing only where you have opted in or where another lawful basis applies and you can opt out.',
            'Improve reliability and product quality using aggregated or de-identified analytics where appropriate.',
          ],
        },
        {
          id: 'legal-basis',
          title: 'Legal basis / justification',
          paragraphs: [
            'Under Jamaica’s Data Protection Act framework, we process personal data fairly and lawfully for specific purposes. Depending on the activity, processing may rely on your consent (for example non-essential cookies or marketing emails), necessity to perform a contract with you, compliance with a legal obligation, or another recognised condition for processing. Where consent is required, it must be informed, freely given, specific, and unambiguous — and you may withdraw it.',
          ],
        },
        {
          id: 'sharing',
          title: 'Sharing and disclosures',
          paragraphs: [
            'We do not sell your personal information. We share data with service providers who help us operate Marketme, only as needed for their role, and with authorities when required by law.',
          ],
          bullets: legalCompany.subprocessors.map(
            (s) => `${s.name} — ${s.purpose} (${s.region}).`
          ),
        },
        {
          id: 'transfers',
          title: 'Cross-border transfers',
          paragraphs: [
            `Because Marketme uses cloud infrastructure, personal data may be transferred to and processed outside ${legalCompany.country}, including in the United States and other regions where our subprocessors operate. By using the service, you understand that overseas processing is necessary to deliver Marketme. We select providers that offer appropriate security and contractual protections, and we continue to review those arrangements.`,
          ],
        },
        {
          id: 'retention',
          title: 'Retention',
          paragraphs: [
            'We keep personal data only as long as needed for the purposes above, including account life, security, dispute resolution, and legal retention requirements. When an account is deleted, we delete or anonymise associated personal data within a reasonable period unless we must retain a limited record for legal or security reasons.',
          ],
        },
        {
          id: 'security',
          title: 'Security',
          paragraphs: [
            'We use technical and organisational measures appropriate to the risk, such as encrypted transport (HTTPS), access controls, hashed passwords, and vendor security practices. No method of transmission or storage is perfectly secure. We do not claim certifications we have not obtained.',
          ],
        },
        {
          id: 'rights',
          title: 'Your rights',
          paragraphs: [
            'Subject to applicable law (including Jamaica’s Data Protection Act), you may request access to your personal data, correction of inaccuracies, deletion, restriction or objection to certain processing, and information about automated decision-taking where relevant.',
            `To exercise rights, email ${legalCompany.privacyEmail} from your account email with enough detail for us to verify your identity and locate the data. We will respond within applicable statutory timelines.`,
          ],
        },
        {
          id: 'cookies',
          title: 'Cookies and similar technologies',
          paragraphs: [
            'We use necessary cookies to keep you signed in and protect the service. Analytics or marketing cookies are used only if you consent where required. See our Cookie Policy for details and controls.',
          ],
        },
        {
          id: 'children',
          title: 'Children',
          paragraphs: [
            'Marketme is intended for business users and adults. We do not knowingly collect personal data from children under 18. If you believe a child has provided data, contact us and we will take appropriate steps.',
          ],
        },
        {
          id: 'changes',
          title: 'Changes',
          paragraphs: [
            'We may update this policy as our practices or legal requirements change. We will revise the “Last updated” date and, for material changes, provide additional notice where appropriate.',
          ],
        },
      ]}
    />
  )
}
