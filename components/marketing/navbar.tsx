'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
<<<<<<< HEAD
import { Activity, Menu, X } from 'lucide-react'
=======
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
>>>>>>> origin/development
import { cn } from '@/lib/utils'
import { sessionClient } from '@/lib/auth-session'

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
] as const
<<<<<<< HEAD

export function Navbar() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [isCondensed, setIsCondensed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
=======

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
  const [isCondensed, setIsCondensed] = useState(
    () => typeof window !== 'undefined' && window.scrollY > ENTER_SCROLL
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const layoutTransition = reduceMotion ? snapTransition : islandSpring
>>>>>>> origin/development

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

<<<<<<< HEAD
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
=======
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsCondensed((prev) => (prev ? latest > EXIT_SCROLL : latest > ENTER_SCROLL))
  })
>>>>>>> origin/development

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

<<<<<<< HEAD
=======
  const compact = isCondensed || menuOpen
>>>>>>> origin/development
  const ctaHref = user ? '/dashboard' : '/signup'
  const ctaLabel = user ? 'Dashboard' : 'Try free'

  return (
<<<<<<< HEAD
    <div className="pointer-events-none fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
      {/*
        When condensed the pill is content-sized — the wrapper must shrink too,
        or flex centering only centers a full-width shell and the pill sticks left.
        Keep full width while the mobile menu is open so the panel can span.
      */}
      <div
        className={cn(
          'pointer-events-auto relative max-w-[1000px]',
          isCondensed && !menuOpen
=======
    <div className="pointer-events-none fixed top-[max(1rem,env(safe-area-inset-top))] right-0 left-0 z-50 flex justify-center px-4 md:top-[max(1.5rem,env(safe-area-inset-top))]">
      <motion.div
        layout
        transition={layoutTransition}
        className={cn(
          'pointer-events-auto relative max-w-[1000px]',
          compact && !menuOpen
>>>>>>> origin/development
            ? 'w-fit max-w-[calc(100vw-2rem)]'
            : 'w-full'
        )}
      >
<<<<<<< HEAD
        <nav
          aria-label="Primary"
          className={cn(
            'flex w-full items-center justify-between rounded-full transition-[padding,background-color,border-color,box-shadow] duration-300',
            isCondensed || menuOpen
              ? 'gap-4 border border-white/10 bg-white/5 px-4 py-2.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-[20px] backdrop-saturate-[1.8] md:gap-10'
              : 'gap-4 border-transparent bg-transparent px-6 py-4 shadow-none'
          )}
        >
          <div className="flex shrink-0 items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2"
=======
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
>>>>>>> origin/development
              onClick={() => setMenuOpen(false)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                <Activity className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tighter text-white">
                Marketme
              </span>
            </Link>

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/development
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {!user ? (
              <Link
                href="/login"
<<<<<<< HEAD
                className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white md:block"
=======
                className="hidden rounded-sm text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] md:block"
>>>>>>> origin/development
              >
                Log in
              </Link>
            ) : null}
            <Link
              href={ctaHref}
<<<<<<< HEAD
              className="inline-flex h-9 items-center justify-center rounded-full border-0 bg-white px-5 text-sm font-medium text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
=======
              className="inline-flex h-9 items-center justify-center rounded-full border-0 bg-white px-5 text-sm font-medium text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-[transform,background-color] duration-150 ease-out hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
>>>>>>> origin/development
            >
              {ctaLabel}
            </Link>
            <button
              type="button"
<<<<<<< HEAD
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white md:hidden"
=======
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] md:hidden"
>>>>>>> origin/development
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
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/development
    </div>
  )
}
