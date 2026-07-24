import { ProblemStatement } from '@/components/marketing/problem-statement'
import { HomeCapabilities } from '@/components/marketing/home-capabilities'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { FaqSection } from '@/components/marketing/faq-section'
import { FinalCta } from '@/components/marketing/final-cta'

/** Below-fold home sections — static where possible; HowItWorks / FAQ stay client islands. */
export function HomeBelowFold() {
  return (
    <>
      <ProblemStatement />
      <HomeCapabilities />
      <HowItWorks />
      <FaqSection />
      <FinalCta />
    </>
  )
}
