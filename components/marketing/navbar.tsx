'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { Activity, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sessionClient } from '@/lib/auth-session'

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
] as const

export function Navbar() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [isCondensed, setIsCondensed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    let cancelled = false

    void sessionClient
      .getSession()
      .then((result) => {
        if (cancelled) return
        setUser(result.data?.user ?? null)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

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

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const ctaHref = user ? '/dashboard' : '/signup'
  const ctaLabel = user ? 'Dashboard' : 'Try free'

  return (
    <div className="pointer-events-none fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
      <div className="pointer-events-auto relative w-full max-w-[1000px]">
        <nav
          aria-label="Primary"
          className={cn(
            'flex items-center justify-between rounded-full transition-[width,padding,background-color,border-color,box-shadow] duration-300',
            isCondensed || menuOpen
              ? 'w-full gap-4 border border-white/10 bg-white/5 px-4 py-2.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-[20px] backdrop-saturate-[1.8] md:w-fit md:gap-16'
              : 'w-full gap-4 border-transparent bg-transparent px-6 py-4 shadow-none'
          )}
        >
          <div className="flex shrink-0 items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                <Activity className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tighter text-white">
                Marketme
              </span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {!user ? (
              <Link
                href="/login"
                className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white md:block"
              >
                Log in
              </Link>
            ) : null}
            <Link
              href={ctaHref}
              className="inline-flex h-9 items-center justify-center rounded-full border-0 bg-white px-5 text-sm font-medium text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
            >
              {ctaLabel}
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white md:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {menuOpen ? (
          <div
            id={menuId}
            className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]/95 p-3 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {!user ? (
                <li>
                  <Link
                    href="/login"
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
