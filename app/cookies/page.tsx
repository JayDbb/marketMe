import { ManageCookiesButton } from '@/components/legal/manage-cookies-button'
import { LegalDocument } from '@/components/legal/legal-document'
import { createPageMetadata } from '@/lib/metadata'
import { legalCompany } from '@/lib/legal-company'

export const metadata = createPageMetadata({
  title: 'Cookie Policy',
  description:
    'How Marketme uses cookies and similar technologies, and how you can manage consent.',
  path: '/cookies',
})

export const dynamic = 'force-static'

const cookieInventory = [
  {
    name: 'marketme-cookie-consent-v1',
    purpose: 'Stores your cookie preference choices',
    duration: '1 year (localStorage)',
    provider: 'Marketme',
    category: 'Necessary',
  },
  {
    name: 'Better Auth session cookies',
    purpose: 'Keep you signed in securely',
    duration: 'Session / as configured by auth',
    provider: 'Marketme / Better Auth',
    category: 'Necessary',
  },
  {
    name: 'Hosting / edge security cookies',
    purpose: 'Load balancing, bot protection, CDN',
    duration: 'Varies by provider',
    provider: 'Vercel',
    category: 'Necessary',
  },
  {
    name: 'First-party analytics (if allowed)',
    purpose: 'Aggregate product usage and performance',
    duration: 'Up to 13 months',
    provider: 'Marketme',
    category: 'Analytics (consent)',
  },
]

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      description="Details on cookies, storage, and consent controls on Marketme."
      lastUpdated={legalCompany.lastUpdated}
      intro={`This Cookie Policy explains how ${legalCompany.tradingName} uses cookies and similar technologies on our website and product, and how you can manage preferences. It should be read with our Privacy Policy.`}
      relatedLinks={[
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/do-not-sell', label: 'Do Not Sell or Share' },
        { href: '/dpa', label: 'Data Processing Agreement' },
      ]}
      headerActions={<ManageCookiesButton />}
      childrenAfterId="inventory"
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
          id: 'consent',
          title: 'Consent',
          paragraphs: [
            'Where Jamaica’s Data Protection Act framework or other applicable law requires informed consent for non-essential tracking, we ask before enabling those cookies. Necessary cookies do not require consent. You can change your choice anytime with Manage cookies on this page.',
          ],
        },
        {
          id: 'inventory',
          title: 'Cookie inventory',
          paragraphs: [
            'The main cookies and similar storage we use are listed in the table below. Providers and durations can change as vendors update their platforms.',
          ],
        },
        {
          id: 'manage',
          title: 'How to manage cookies',
          bullets: [
            'Use Manage cookies on this page to reopen Accept all / Necessary only / Customize.',
            'Clear cookies and site data in your browser settings.',
            'Use browser controls or privacy extensions to block third-party cookies.',
          ],
          note: `Questions: ${legalCompany.privacyEmail}`,
        },
      ]}
    >
      <div id="cookie-table" className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
          <caption className="sr-only">Cookie and storage inventory</caption>
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-[10px] tracking-wider text-white/40 uppercase">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Provider</th>
              <th className="px-4 py-3 font-semibold">Category</th>
            </tr>
          </thead>
          <tbody>
            {cookieInventory.map((row) => (
              <tr key={row.name} className="border-b border-white/8 last:border-0">
                <td className="px-4 py-3 font-medium text-white/80">{row.name}</td>
                <td className="px-4 py-3 text-white/50">{row.purpose}</td>
                <td className="px-4 py-3 text-white/50">{row.duration}</td>
                <td className="px-4 py-3 text-white/50">{row.provider}</td>
                <td className="px-4 py-3 text-white/50">{row.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LegalDocument>
  )
}
