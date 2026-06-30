import nextDynamic from "next/dynamic";
import { Hero } from "@/components/marketing/hero";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const dynamic = "force-static";

const LogoBar = nextDynamic(
  () => import("@/components/marketing/logo-bar").then((m) => ({ default: m.LogoBar })),
  { ssr: false }
);
const ProblemStatement = nextDynamic(
  () =>
    import("@/components/marketing/problem-statement").then((m) => ({
      default: m.ProblemStatement,
    })),
  { ssr: false }
);
const SocialProof = nextDynamic(
  () =>
    import("@/components/marketing/social-proof").then((m) => ({
      default: m.SocialProof,
    })),
  { ssr: false }
);
const HowItWorks = nextDynamic(
  () =>
    import("@/components/marketing/how-it-works").then((m) => ({
      default: m.HowItWorks,
    })),
  { ssr: false }
);
const FaqSection = nextDynamic(
  () =>
    import("@/components/marketing/faq-section").then((m) => ({
      default: m.FaqSection,
    })),
  { ssr: false }
);
const FinalCta = nextDynamic(
  () =>
    import("@/components/marketing/final-cta").then((m) => ({
      default: m.FinalCta,
    })),
  { ssr: false }
);

export default function Home() {
  return (
    <MarketingPageShell>
      <Hero />
      <LogoBar />
      <div className="w-full max-w-5xl mx-auto h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />

      <ProblemStatement />
      <SocialProof />
      <HowItWorks />
      <FaqSection />
      <FinalCta />
    </MarketingPageShell>
  );
}
