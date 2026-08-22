'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function GenerateButton({ businessName }: { profileId?: string; businessName?: string }) {
  return (
    <>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 ui-transition group-hover:scale-[1.03]">
        <Sparkles className="h-7 w-7 text-accent-foreground" aria-hidden="true" />
      </div>

      <h3 className="mb-2 text-lg font-bold text-foreground">Weekly Content</h3>
      <p className="mb-7 max-w-[180px] text-xs leading-relaxed text-muted-foreground">
        Generate optimized social posts and emails for {businessName || 'your business'}.
      </p>

      <Link
        href="/dashboard/generate"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground ui-transition hover:bg-primary/80 active:scale-[0.97]"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Generate now
      </Link>
    </>
  )
}
