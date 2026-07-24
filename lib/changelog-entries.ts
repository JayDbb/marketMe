export type ChangelogTag = 'feature' | 'improvement' | 'fix' | 'legal' | 'security'

export type ChangelogEntry = {
  id: string
  date: string
  version?: string
  title: string
  summary: string
  tags: ChangelogTag[]
  highlights: string[]
}

/** Static product changelog until a CMS is wired. Newest first. */
export const changelogEntries: ChangelogEntry[] = [
  {
    id: '2026-07-marketing-pages',
    date: '2026-07-24',
    title: 'Features, Pricing, and Blog as real product pages',
    summary:
      'Marketing surfaces no longer clone the homepage. Features maps Generate, Studio, Calendar, Inbox, Connections, and Assistant. Pricing uses live Free / Pro / Team limits. Blog ships with static posts and permalinks.',
    tags: ['feature', 'improvement'],
    highlights: [
      'Features deep-dives and plan comparison matrix',
      'Pricing monthly / yearly toggle tied to billing plans',
      'Blog listing + /blog/[slug] post pages',
    ],
  },
  {
    id: '2026-07-studio-uploads',
    date: '2026-07-22',
    title: 'Studio templates upload reliably on Vercel',
    summary:
      'Large template uploads no longer die on the serverless body limit. Studio prepares a signed URL, the browser PUTs the file directly, then we complete the record — so saves work even when client Supabase env is missing.',
    tags: ['fix', 'improvement'],
    highlights: [
      'Signed prepare / complete upload flow',
      'Direct PUT to storage instead of FormData through server actions',
      'Clearer size limits and failure messages in Studio',
    ],
  },
  {
    id: '2026-07-auth-login',
    date: '2026-07-21',
    title: 'Login: magic link + Google, clearer auth screens',
    summary:
      'Password sign-in is gone from the login page. Email magic link and Google remain. Auth shells got contrast fixes, a Back to home path, and a lighter legal checkbox so the clickwrap stays readable.',
    tags: ['improvement', 'fix'],
    highlights: [
      'Magic-link email sign-in restored',
      'Google OAuth continues as the social path',
      'Signup clickwrap and legal checkbox contrast fixed',
    ],
  },
  {
    id: '2026-07-legal',
    date: '2026-07-20',
    version: 'Legal pack',
    title: 'Jamaica-first legal pages and cookie consent',
    summary:
      'Privacy, Terms, Cookies, Acceptable Use, AI ethics, Refunds, and Do Not Sell are live with company details from env. Cookie banner and signup clickwrap make consent explicit; footer Legal keeps Privacy, Terms, and Cookies front and center.',
    tags: ['legal', 'feature'],
    highlights: [
      'Full legal route set with Jamaica-first framing',
      'Cookie consent banner on marketing surfaces',
      'AI notice on Generate review before publish',
    ],
  },
  {
    id: '2026-07-meta-oauth',
    date: '2026-07-15',
    title: 'Meta connections pull real profiles',
    summary:
      'Connections can complete Meta OAuth and load the profiles you actually authorized — not placeholder rows. This is the foundation for scheduling to Facebook and Instagram from Calendar.',
    tags: ['feature'],
    highlights: [
      'Meta OAuth redirect + callback wiring',
      'Real social connection records in the dashboard',
      'Clearer empty and error states when reconnect is needed',
    ],
  },
  {
    id: '2026-07-google-oauth',
    date: '2026-07-10',
    title: 'Google sign-in works on Vercel previews',
    summary:
      'Better Auth now derives its base URL from the request host (with an allowlist), so Google no longer redirects to localhost when you sign in on a *.vercel.app preview or production host.',
    tags: ['fix', 'security'],
    highlights: [
      'Dynamic baseURL + allowedHosts for OAuth callbacks',
      'Preview and production redirect URIs both supported',
      'No more connection-refused loops after Google consent',
    ],
  },
  {
    id: '2026-06-v3',
    date: '2026-06-01',
    version: '3.0',
    title: 'Marketme 3.0 — dark shell and product rebuild',
    summary:
      'The product moved to a deep-navy shell with electric blue accents, atmospheric gradients, and a rebuilt dashboard chrome. Calendar, Generate, Studio, and navigation were redesigned around how operators actually work week to week.',
    tags: ['feature', 'improvement'],
    highlights: [
      'Global dark aesthetic and glass surfaces',
      'Content calendar and Kanban redesign',
      'Responsive sidebars and faceted dashboard nav',
      'Auth screens and marketing hero aligned to the new system',
    ],
  },
]

export function getChangelogEntries(): ChangelogEntry[] {
  return [...changelogEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function formatChangelogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const changelogTagLabels: Record<ChangelogTag, string> = {
  feature: 'Feature',
  improvement: 'Improvement',
  fix: 'Fix',
  legal: 'Legal',
  security: 'Security',
}
