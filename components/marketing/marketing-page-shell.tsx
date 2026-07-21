import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'
import { MarketingPageBackground, MarketingPageMain } from '@/components/marketing/marketing-page-background'

interface MarketingPageShellProps {
  children: React.ReactNode
  showNavbar?: boolean
  showFooter?: boolean
  mainClassName?: string
  className?: string
}

/** Static marketing page wrapper — auth resolved client-side in Navbar. */
export function MarketingPageShell({
  children,
  showNavbar = true,
  showFooter = true,
  mainClassName,
  className,
}: MarketingPageShellProps) {
  return (
    <MarketingPageBackground className={className}>
      {showNavbar ? <Navbar /> : null}
      <MarketingPageMain className={mainClassName}>{children}</MarketingPageMain>
      {showFooter ? <Footer /> : null}
    </MarketingPageBackground>
  )
}
