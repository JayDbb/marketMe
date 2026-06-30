'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-session'

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
] as const

export function Navbar() {
  const { data: session } = useSession()
  const user = session?.user ?? null
  const [isCondensed, setIsCondensed] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setIsCondensed(window.scrollY > 50)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav
        aria-label="Primary"
        className={cn(
          'pointer-events-auto flex items-center justify-between rounded-full transition-[width,padding,background,border,box-shadow] duration-300',
          isCondensed
            ? 'w-fit gap-8 md:gap-16 px-4 py-2.5 border border-white/10 bg-white/5 backdrop-blur-[20px] backdrop-saturate-[1.8] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]'
            : 'w-full max-w-[1000px] gap-4 px-6 py-4 border-transparent bg-transparent shadow-none'
        )}
      >
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)] shrink-0">
              <Activity className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-serif font-medium text-xl tracking-tighter text-white">
              Marketme
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {!user && (
            <Link
              href="/login"
              className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Log in
            </Link>
          )}
          <Link
            href={user ? '/dashboard' : '/signup'}
            className="inline-flex items-center justify-center bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0 rounded-full px-5 shadow-[0_0_20px_rgba(255,255,255,0.1)] font-medium h-9 text-sm"
          >
            {user ? 'Dashboard' : 'Try free'}
          </Link>
        </div>
      </nav>
    </div>
  )
}
