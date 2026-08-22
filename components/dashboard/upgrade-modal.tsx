"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Rocket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    name: "Bronze",
    description: "For individuals with scheduling needs.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    features: { workspaces: 1, users: 1, socialProfiles: 5, credits: 100 },
  },
  {
    name: "Silver",
    description: "For small teams building their brand.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    popular: true,
    features: { workspaces: 5, users: 5, socialProfiles: 20, credits: 500 },
  },
  {
    name: "Gold",
    description: "For bigger teams or solo freelancers.",
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: { workspaces: 20, users: 20, socialProfiles: 50, credits: 1500 },
  },
  {
    name: "Diamond",
    description: "For large teams or marketing agencies.",
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: {
      workspaces: "Unlimited",
      users: 50,
      socialProfiles: 150,
      credits: "Unlimited",
    },
  },
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl sm:max-w-6xl bg-card border-border text-card-foreground p-10 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="flex flex-col items-center text-center mb-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Rocket className="w-6 h-6 text-zinc-900 dark:text-white" />
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight">
            Upgrade Marketme
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-white/50 text-base">
            Compare workspace limits, social profiles, and shared credits for
            your social media team.
          </DialogDescription>

          <div className="flex items-center gap-1 p-1 bg-white dark:bg-white/5 border-zinc-200 rounded-xl border dark:border-white/10 mt-4">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${!isYearly ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${isYearly ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:text-white"}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl bg-white dark:bg-white/2 border-zinc-200 border p-6 flex flex-col relative transition-all duration-300 ${
                plan.popular
                  ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-blue-500/5 scale-105 z-10"
                  : "border-zinc-200 dark:border-white/10 hover:border-zinc-200 dark:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6 bg-blue-500 text-zinc-900 dark:text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white/40 mb-6 min-h-[32px]">
                {plan.description}
              </p>

              <div className="mb-6 h-20">
                <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-zinc-500 dark:text-white/40 text-sm">
                  {" "}
                  / month
                </span>
                <p className="text-xs text-zinc-500 dark:text-white/30 mt-1">
                  {isYearly
                    ? `Billed $${plan.yearlyPrice * 12} yearly`
                    : "Billed monthly"}
                </p>
              </div>

              <Button
                onClick={() =>
                  toast.info(
                    "Paid checkout is coming soon — payment provider not selected yet.",
                  )
                }
                className={`w-full h-11 mb-8 font-bold rounded-xl transition-all ${
                  plan.popular
                    ? "bg-blue-500 hover:bg-blue-400 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "bg-white dark:bg-white/10 border-zinc-200 hover:bg-white dark:bg-white/20 shadow-none border dark:border-white/5"
                }`}
              >
                Try 7 days free
              </Button>

              <div className="mt-auto">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-white/30 uppercase tracking-wider mb-4">
                  What&apos;s included
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-white/60 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-500 dark:text-white/20" />
                      Workspaces
                    </span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {plan.features.workspaces}
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-white/60 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-500 dark:text-white/20" />
                      Users
                    </span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {plan.features.users}
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-white/60 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-500 dark:text-white/20" />
                      Social profiles
                    </span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {plan.features.socialProfiles}
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-white/60 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-500 dark:text-white/20" />
                      Credits
                    </span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {plan.features.credits}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
