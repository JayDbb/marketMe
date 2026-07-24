'use client'

import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { legalCompany } from '@/lib/legal-company'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What is included on Free, Pro, and Team?',
    answer:
      'Free covers the core loop — Generate, Studio, and Calendar — with modest AI credits and one social profile. Pro raises credits, posts, and profiles. Team adds more seats, workspaces, and room to scale. See Pricing for exact limits.',
  },
  {
    question: 'How does AI generation work?',
    answer:
      'You give Marketme your business context and goals. It drafts captions and ideas for the platforms you choose. Every draft is meant for human review before you schedule or publish — generation is assistive, not autopilot.',
  },
  {
    question: 'Do posts go live without my approval?',
    answer:
      'No. Marketme is built so you review drafts before they hit the calendar. That keeps tone, claims, and disclosures under your control.',
  },
  {
    question: 'Which platforms can I connect?',
    answer:
      'Connections use official OAuth flows. Meta (Facebook / Instagram) is the primary path today, with clear status in the dashboard when a reconnect is needed. More channels follow the same pattern as they ship.',
  },
  {
    question: 'Can my team approve content before it publishes?',
    answer:
      'Team plans are built for shared workspaces and members. Use review before schedule as your approval gate — we are expanding formal approval workflows as the product matures.',
  },
  {
    question: 'Is my data sold or shared for ads?',
    answer:
      'We do not sell your personal data. Privacy, Cookies, and related legal pages explain what we collect, why, and your choices under Jamaica-first framing. Contact privacy if you have a request.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Most people can sign up, connect an account, and generate a first draft in a few minutes. No engineering work required.',
  },
]

export function FaqSection() {
  const supportMailto = `mailto:${legalCompany.supportEmail}`

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-3 lg:gap-16">
        <div className="md:col-span-2">
          <h2 className="mb-10 font-serif text-3xl font-light leading-tight tracking-tighter text-white md:text-5xl">
            Frequently asked{' '}
            <span className="font-serif italic font-medium text-sky-400">questions</span>
          </h2>

          <Accordion className="w-full space-y-0">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`item-${i}`}
                className="border-white/8 last:border-b-0"
              >
                <AccordionTrigger className="py-5 pr-4 text-left text-sm font-light text-white/70 transition-colors duration-200 hover:text-white/90 hover:no-underline md:text-base [&[data-state=open]>svg]:text-sky-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-lg pb-5 text-sm leading-relaxed text-white/45">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="md:col-span-1 md:pt-24">
          <div className="sticky top-24 rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm md:p-8">
            <h3 className="mb-3 font-serif text-lg font-medium text-white">
              Still have questions?
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-white/40">
              Email support or browse Help — we reply as soon as we can.
            </p>

            <Link
              href={supportMailto}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'mb-3 h-12 w-full rounded-full border-0 bg-white font-medium text-black hover:bg-white/90'
              )}
            >
              Email support
            </Link>
            <Link
              href="/help"
              className="block text-center text-sm font-medium text-white/45 transition-colors hover:text-sky-300"
            >
              Visit Help →
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/8 pt-6 text-xs tracking-wide text-white/40">
              <Link href="/privacy" className="hover:text-white/70">
                Privacy
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/pricing" className="hover:text-white/70">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
