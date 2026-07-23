import { createPageMetadata } from '@/lib/metadata'
import { LegalDocument } from '@/components/legal/legal-document'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'Cookie Policy',
  description:
    'How Marketme uses cookies and similar technologies, and how you can manage consent.',
  path: '/cookies',
})

export const dynamic = 'force-static'

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      description="Details on cookies, storage, and consent controls on Marketme."
      intro={`This Cookie Policy explains how ${legalCompany.tradingName} uses cookies and similar technologies on our website and product, and how you can manage preferences. It should be read with our Privacy Policy.`}
      relatedLinks={[
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/do-not-sell', label: 'Do Not Sell or Share' },
      ]}
      sections={[
        {
          id: 'what',
          title: 'What are cookies?',
          paragraphs: [
            'Cookies are small text files stored on your device. Similar technologies include local storage and pixels. They help the site function, remember preferences, and (if you allow) measure traffic.',
          ],
        },
        {
          id: 'types',
          title: 'Types we use',
          bullets: [
            'Strictly necessary — authentication sessions, security, load balancing, consent storage. These are required for the service to work.',
            'Preferences — remembering UI settings such as theme where applicable.',
            'Analytics — understanding aggregate usage to improve the product (only with consent where required).',
            'Marketing — measuring campaigns or advertising effectiveness (only with consent where required; not enabled by default unless configured).',
          ],
        },
        {
          id: 'examples',
          title: 'Examples',
          bullets: [
            'Session / auth cookies used by Better Auth to keep you signed in.',
            'Consent preference stored after you accept or reject non-essential cookies.',
            'Hosting/security cookies set by our infrastructure provider.',
          ],
        },
        {
          id: 'consent',
          title: 'Consent',
          paragraphs: [
            'Where Jamaica’s Data Protection Act framework or other applicable law requires informed consent for non-essential tracking, we ask before enabling those cookies. Necessary cookies do not require consent. You can change your choice later by clearing site data or using the cookie controls on this site.',
          ],
        },
        {
          id: 'manage',
          title: 'How to manage cookies',
          bullets: [
            'Use the cookie banner choices (Accept all / Necessary only / Customize) when shown.',
            'Clear cookies and site data in your browser settings.',
            'Use browser controls or privacy extensions to block third-party cookies.',
          ],
          note: `Questions: ${legalCompany.privacyEmail}`,
        },
      ]}
    />
  )
}
