'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Menu, X } from 'lucide-react'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { cn } from '@/lib/utils'
import { sessionClient } from '@/lib/auth-session'

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
] as const

const ENTER_SCROLL = 72
const EXIT_SCROLL = 18

const islandSpring = { type: 'spring' as const, stiffness: 380, damping: 36, mass: 0.85 }
const snapTransition = { duration: 0 }

export function Navbar() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const progressX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  })

  const [user, setUser] = useState<{ id: string } | null>(null)
  const [isCondensed, setIsCondensed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const layoutTransition = reduceMotion ? snapTransition : islandSpring

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
    setIsCondensed(window.scrollY > ENTER_SCROLL)
  }, [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsCondensed((prev) => (prev ? latest > EXIT_SCROLL : latest > ENTER_SCROLL))
  })

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const compact = isCondensed || menuOpen
  const ctaHref = user ? '/dashboard' : '/signup'
  const ctaLabel = user ? 'Dashboard' : 'Try free'

  return (
    <div className="pointer-events-none fixed top-[max(1rem,env(safe-area-inset-top))] right-0 left-0 z-50 flex justify-center px-4 md:top-[max(1.5rem,env(safe-area-inset-top))]">
      <motion.div
        layout
        transition={layoutTransition}
        className={cn(
          'pointer-events-auto relative max-w-[1000px]',
          compact && !menuOpen
            ? 'w-fit max-w-[calc(100vw-2rem)]'
            : 'w-full'
        )}
      >
        <motion.nav
          layout
          aria-label="Primary"
          transition={layoutTransition}
          className={cn(
            'relative flex w-full items-center justify-between rounded-full',
            compact ? 'gap-4 px-4 py-2.5 md:gap-10' : 'gap-4 px-6 py-4'
          )}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-[20px] backdrop-saturate-[1.8]"
            initial={false}
            animate={{ opacity: compact ? 1 : 0 }}
            transition={
              reduceMotion
                ? snapTransition
                : { duration: 0.28, ease: [0.23, 1, 0.32, 1] }
            }
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-5 bottom-1 z-10 h-px origin-left rounded-full bg-sky-400/70"
            style={{ scaleX: reduceMotion ? (compact ? 1 : 0) : progressX }}
            initial={false}
            animate={{ opacity: compact ? 1 : 0 }}
            transition={
              reduceMotion
                ? snapTransition
                : { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
            }
          />

          <div className="flex min-w-0 shrink-0 items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
              onClick={() => setMenuOpen(false)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                <Activity className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tighter text-white">
                Marketme
              </span>
            </Link>

            <LayoutGroup>
              <div className="hidden items-center gap-6 md:flex">
                {navLinks.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'relative py-1 text-sm font-medium transition-colors duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-sm',
                        isActive
                          ? 'text-white'
                          : 'text-white/60 hover:text-white'
                      )}
                    >
                      {item.label}
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-0 -bottom-0.5 h-px bg-sky-400"
                          transition={layoutTransition}
                        />
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </LayoutGroup>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {!user ? (
              <Link
                href="/login"
                className="hidden rounded-sm text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] md:block"
              >
                Log in
              </Link>
            ) : null}
            <Link
              href={ctaHref}
              className="inline-flex h-9 items-center justify-center rounded-full border-0 bg-white px-5 text-sm font-medium text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-[transform,background-color] duration-150 ease-out hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            >
              {ctaLabel}
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] md:hidden"
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
        </motion.nav>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              id={menuId}
              initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(-8px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, transform: 'translateY(-8px)' }
              }
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]/95 p-3 backdrop-blur-xl md:hidden"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
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
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
                      onClick={() => setMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  </li>
                ) : null}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
