import Link from 'next/link'
import { legalCompany } from '@/lib/legal-company'

/** Compact AI responsibility notice for generate / publish flows. */
export function AiContentNotice({ className = '' }: { className?: string }) {
  return (
    <aside
      className={`rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-100/80 ${className}`}
    >
      <p>
        AI drafts can be wrong or incomplete. Review and edit before publishing. You are
        responsible for advertising claims, disclosures, and platform rules.{' '}
        <Link href="/ai-ethics" className="underline underline-offset-2 hover:text-amber-50">
          AI Transparency
        </Link>
        {' · '}
        <Link href="/acceptable-use" className="underline underline-offset-2 hover:text-amber-50">
          Acceptable Use
        </Link>
        .
      </p>
      <p className="mt-1 text-amber-100/50">
        Questions: {legalCompany.legalEmail}
      </p>
    </aside>
  )
}
