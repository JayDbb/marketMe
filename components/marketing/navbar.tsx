import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Activity } from 'lucide-react'
import { Suspense } from 'react'

async function NavbarUserAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user ?? null

  if (user) {
    return (
      <Link href="/dashboard">
        <Button
          size="sm"
          className="bg-white text-zinc-950 font-semibold rounded-full px-5 hover:bg-white/90 active:scale-[0.97] transition-all duration-150 border-0 shadow-[0_0_20px_rgba(99,130,255,0.25)]"
        >
          Dashboard
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/signup">
      <Button
        size="sm"
        className="bg-white text-zinc-950 font-semibold rounded-full px-5 hover:bg-white/90 active:scale-[0.97] transition-all duration-150 border-0 shadow-[0_0_20px_rgba(99,130,255,0.25)]"
      >
        Get for free
      </Button>
    </Link>
  )
}

export function Navbar() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full"
    >
      {/* Glass pill container — matching the reference dark navbar style */}
      <div className="absolute inset-0 max-w-5xl mx-auto rounded-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.5)]">
          <Activity className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <span className="font-serif font-light text-xl tracking-tighter text-white">
          Marketme
        </span>
      </Link>

      {/* Center nav links */}
      <div className="hidden md:flex items-center gap-1 relative z-10">
        {[
          { label: 'About', href: '/about' },
          { label: 'Features', href: '/#features' },
          { label: 'Customers', href: '/#customers' },
          { label: 'Updates', href: '/changelog' },
          { label: 'Help', href: '/help' },
        ].map((item) => {
          const isAnchor = item.href.includes('#');
          const className = "px-3 py-1.5 text-sm text-white/55 hover:text-white/90 transition-colors duration-200 rounded-md hover:bg-white/5";
          
          if (isAnchor) {
            return (
              <a key={item.href} href={item.href} className={className}>
                {item.label}
              </a>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3 relative z-10 min-w-[104px] justify-end">
        <Suspense fallback={<div className="w-[104px] h-9" />}>
          <NavbarUserAction />
        </Suspense>
      </div>
    </nav>
  )
}
