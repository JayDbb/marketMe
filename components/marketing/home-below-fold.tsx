"use client";

import dynamic from "next/dynamic";

const LogoBar = dynamic(
  () => import("@/components/marketing/logo-bar").then((m) => ({ default: m.LogoBar })),
  { ssr: false }
);
const ProblemStatement = dynamic(
  () =>
    import("@/components/marketing/problem-statement").then((m) => ({
      default: m.ProblemStatement,
    })),
  { ssr: false }
);
const SocialProof = dynamic(
  () =>
    import("@/components/marketing/social-proof").then((m) => ({
      default: m.SocialProof,
    })),
  { ssr: false }
);
const HowItWorks = dynamic(
  () =>
    import("@/components/marketing/how-it-works").then((m) => ({
      default: m.HowItWorks,
    })),
  { ssr: false }
);
const FaqSection = dynamic(
  () =>
    import("@/components/marketing/faq-section").then((m) => ({
      default: m.FaqSection,
    })),
  { ssr: false }
);
const FinalCta = dynamic(
  () =>
    import("@/components/marketing/final-cta").then((m) => ({
      default: m.FinalCta,
    })),
  { ssr: false }
);

export function HomeBelowFold() {
  return (
    <>
      <LogoBar />
      <div className="w-full max-w-5xl mx-auto h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />

      <ProblemStatement />
      <SocialProof />
      <HowItWorks />
      <FaqSection />
      <FinalCta />
    </>
  );
}
