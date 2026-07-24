export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readMinutes: number
  featured?: boolean
  body: string[]
}

/** Static posts until a CMS is wired. */
export const blogPosts: BlogPost[] = [
  {
    slug: 'human-review-before-you-publish-ai',
    title: 'Why every AI draft needs a human pass before it goes live',
    excerpt:
      'AI can fill a calendar fast. Your brand still owns the claims, tone, and platform rules — here is a practical review checklist.',
    category: 'AI & ethics',
    date: '2026-07-18',
    readMinutes: 6,
    featured: true,
    body: [
      'Marketme is built so generation is a draft step, not an autopilot for your reputation. That is intentional. Advertising law, platform policies, and customer trust all assume a person stood behind the message.',
      'Before you hit schedule, scan for three things: accuracy (prices, dates, locations), tone (does this sound like your brand?), and claims (can you substantiate every promise?). If any of those fail, edit or regenerate.',
      'For sponsored or endorsement-style posts, add clear disclosures. Jamaica’s Fair Competition Act expects advertising that is not misleading; other markets add their own AI or sponsorship rules. When in doubt, be more transparent than you think you need to be.',
      'Use Studio to lock visual consistency, then Generate for copy variants, then Calendar to place posts where your audience is actually online. Speed matters — judgment matters more.',
    ],
  },
  {
    slug: 'weekly-content-calendar-for-small-teams',
    title: 'A one-week content calendar that small teams can actually keep',
    excerpt:
      'Three posts, one story set, and a fixed review day — a lightweight rhythm for cafés, boutiques, and solo operators.',
    category: 'Scheduling',
    date: '2026-07-10',
    readMinutes: 5,
    featured: true,
    body: [
      'Most small businesses do not fail at social because they lack ideas. They fail because the week has no container. A simple calendar beat beats an empty “post when inspired” promise.',
      'Try this default: Monday brief (what is true about the business this week), Wednesday publish (one primary post), Friday engagement (reply, restock Stories). Leave Tuesday/Thursday for optional boosts when you have capacity.',
      'In Marketme, run Generate once with a clear goal — foot traffic, product launch, or brand awareness — then drop approved drafts onto Calendar. Batch the creative work so publishing days stay light.',
      'Protect one 30-minute block for human review. That single habit prevents most “we posted the wrong price” disasters.',
    ],
  },
  {
    slug: 'studio-templates-that-travel',
    title: 'Build Studio templates that survive more than one campaign',
    excerpt:
      'Reusable canvases save hours. Here is how to design templates that stay on-brand when the offer changes.',
    category: 'Studio',
    date: '2026-07-02',
    readMinutes: 4,
    body: [
      'A good template is mostly empty space with strong hierarchy: logo zone, headline zone, proof zone. If every layer is locked to last month’s promo copy, you will fight the file every week.',
      'Upload brand boards and product shots into Studio, then create two masters — square feed and vertical story. Keep typography and margins consistent so Generate captions can pair with either format.',
      'Name templates by job, not by campaign: “Offer · square”, “Behind the scenes · story”. Future you will thank present you when the calendar fills up.',
    ],
  },
  {
    slug: 'connecting-instagram-the-right-way',
    title: 'Connect Instagram with OAuth — and why password sharing is a dead end',
    excerpt:
      'Official connections keep accounts safer and make App Review possible. Skip the shady “enter your password” tools.',
    category: 'Connections',
    date: '2026-06-22',
    readMinutes: 5,
    body: [
      'If a tool asks for your Instagram password, walk away. Marketme connects through official OAuth flows so tokens can be revoked and scopes stay explicit.',
      'Expect Google or Meta login screens, not a form on our site collecting credentials. That pattern also matches what Meta requires for serious publishing apps.',
      'After connecting, check Connections for status. If auth expires, reconnect before a big launch week — scheduled posts cannot heal a broken token.',
    ],
  },
  {
    slug: 'credits-and-generation-without-surprises',
    title: 'How AI credits work without surprise bills',
    excerpt:
      'Free and paid plans meter generation differently. Know what a credit buys before you batch a month of drafts.',
    category: 'Product',
    date: '2026-06-14',
    readMinutes: 4,
    body: [
      'Credits exist so generation stays fair across free and paid tiers. Each generation run consumes credits based on the pipeline cost for that action.',
      'On Free, treat credits like a weekly budget: generate fewer, higher-quality packs, then schedule what you approve. On Pro and Team, higher allowances support fuller calendars.',
      'If a run fails, you should not be charged for a blank result — but always watch the balance in Generate before kicking off a large batch.',
      'Billing renewals and refunds are covered in our Refunds & Billing policy. Prices shown at checkout are the source of truth when paid billing is enabled.',
    ],
  },
]

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
