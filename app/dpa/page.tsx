import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'Data Processing Agreement',
  description:
    'Marketme Data Processing Agreement (DPA) for business customers who need processor terms under Jamaica’s Data Protection Act framework.',
  path: '/dpa',
})

export const dynamic = 'force-static'

export default function DpaPage() {
  return (
    <LegalDocument
      title="Data Processing Agreement"
      description="Processor terms for business customers who use Marketme to process personal data on their behalf."
      lastUpdated={legalCompany.lastUpdated}
      intro={`This Data Processing Agreement (“DPA”) forms part of the agreement between ${legalCompany.legalEntityName} (“Processor”, “Marketme”, “we”) and the business customer that uses Marketme (“Controller”, “you”). It applies when we process personal data on your behalf in providing the Marketme service. It is designed to support Jamaica’s Data Protection Act, 2020 standards and common B2B diligence requests. It is not legal advice — have counsel review before relying on it for enterprise procurement.`}
      relatedLinks={[
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/contact', label: 'Contact' },
      ]}
      sections={[
        {
          id: 'roles',
          title: 'Roles of the parties',
          paragraphs: [
            'You are the Controller of personal data you submit to Marketme (for example customer lists, audience notes, captions containing personal data, or employee account details for your workspace).',
            `We are the Processor for that customer content. We are Controller for our own business data (account records, billing, product telemetry) as described in the Privacy Policy.`,
          ],
        },
        {
          id: 'scope',
          title: 'Subject matter and duration',
          paragraphs: [
            'We process personal data only to provide Generate, Studio, Calendar, Connections, Inbox, and related support features, for the duration of your subscription and any retention period required by law or stated in the Privacy Policy.',
            'Categories of data depend on what you upload or connect: identifiers, contact details, content you create, and social account metadata from connected platforms.',
          ],
        },
        {
          id: 'instructions',
          title: 'Processing instructions',
          bullets: [
            'We process personal data only on documented instructions from you (including configuration of the product and your use of features), unless law requires otherwise.',
            'We will not sell personal data you entrust to us as Controller content.',
            'If we believe an instruction infringes applicable data protection law, we will inform you when legally permitted.',
          ],
        },
        {
          id: 'security',
          title: 'Security measures',
          paragraphs: [
            'We implement appropriate technical and organisational measures including access controls, encrypted transport (HTTPS), least-privilege production access, and vendor diligence for subprocessors. No measure is perfect; residual risk remains.',
          ],
        },
        {
          id: 'subprocessors',
          title: 'Subprocessors',
          paragraphs: [
            'You authorise us to engage subprocessors listed in our Privacy Policy (hosting, database, auth, AI providers, email, background jobs, payments when enabled). We remain responsible for their performance as relates to this DPA.',
            'We will update the Privacy Policy subprocessor list when material vendors change. Continued use after notice constitutes acceptance for operational updates; material objection rights can be discussed via legal@.',
          ],
        },
        {
          id: 'transfers',
          title: 'International transfers',
          paragraphs: [
            `Subprocessors may process data outside ${legalCompany.country}. Where required, we rely on appropriate safeguards and contractual protections with vendors. Details are summarised in the Privacy Policy.`,
          ],
        },
        {
          id: 'assistance',
          title: 'Assistance with rights and incidents',
          bullets: [
            'We will assist you, where reasonably possible, in responding to data subject requests that relate to data we process as your Processor.',
            'We will notify you without undue delay after becoming aware of a personal data breach affecting Controller content we process, and provide information reasonably available to us.',
            `Privacy contact: ${legalCompany.privacyEmail}. Legal: ${legalCompany.legalEmail}.`,
          ],
        },
        {
          id: 'deletion',
          title: 'Return or deletion',
          paragraphs: [
            'On termination of the service, we will delete or return Controller content in accordance with product capabilities and the retention rules in the Privacy Policy, except where law requires retention.',
          ],
        },
        {
          id: 'audit',
          title: 'Information and audit',
          paragraphs: [
            'Upon written request, we will provide information reasonably necessary to demonstrate compliance with this DPA. Formal audits are available by mutual written agreement, subject to confidentiality, reasonable notice, and frequency limits.',
          ],
        },
        {
          id: 'liability',
          title: 'Liability and precedence',
          paragraphs: [
            'Liability caps and exclusions in the Terms of Service apply to this DPA unless a signed order form states otherwise. If there is a conflict between this DPA and the Terms regarding processing of personal data, this DPA controls for that conflict.',
          ],
        },
      ]}
    />
  )
}
