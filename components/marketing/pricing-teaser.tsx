'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for individuals getting started.",
    features: ["30 posts/month", "Instagram only"],
    recommended: false,
    cta: "Get started"
  },
  {
    name: "Growth",
    price: "$79",
    period: "/month",
    description: "Everything you need to scale your presence.",
    features: ["Unlimited content", "Competitor tracking", "AI reply assistant"],
    recommended: true,
    cta: "Get started"
  },
  {
    name: "Pro",
    price: "$149",
    period: "/month",
    description: "Built for agencies and marketing teams.",
    features: ["Multi-location businesses", "Team access", "Advanced analytics"],
    recommended: false,
    cta: "Get started"
  }
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="py-32 bg-transparent border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-white tracking-tight">
            Simple, transparent pricing.
          </h2>
          <p className="text-lg text-white/50">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => (
            <Card 
              key={idx}
              className={`relative overflow-visible bg-white/4 backdrop-blur-sm rounded-2xl p-8 flex flex-col h-full border transition-all ${
                plan.recommended 
                  ? 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] md:-mt-4 ring-0' 
                  : 'border-white/8
              }`}
            >
              {plan.recommended && (
                <Badge variant="default" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white hover:bg-blue-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border-0 z-10">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-0 flex flex-col h-full">
              
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-medium font-sans text-white">{plan.name}</h3>
                <p className="text-sm text-white/50 h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-serif font-light text-white">{plan.price}</span>
                {plan.period && <span className="text-white/40">{plan.period}</span>}
              </div>

              <Button 
                className={`w-full mb-8 rounded-full h-11 font-medium border-0 transition-all ${
                  plan.recommended
                    ? 'bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4 mt-auto">
                <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-4">Includes</p>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/70">{feat}</span>
                  </div>
                ))}
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-center text-sm text-white/40">
          No credit card required on the free tier.
        </p>

      </div>
    </section>
  );
}
