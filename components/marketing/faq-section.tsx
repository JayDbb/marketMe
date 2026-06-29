"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How does pricing work for teams?",
    answer:
      "Marketme pricing scales with your team size. Every plan includes unlimited campaigns and lead routing. You only pay for the active contacts you manage each month — no hidden fees, no seat charges.",
  },
  {
    question: "How does the AI generate content?",
    answer:
      "Our AI is trained on top-performing marketing campaigns. You provide a prompt, and it generates platform-optimized copy, hashtags, and visual suggestions. It learns your brand voice over time.",
  },
  {
    question: "Can I set approval workflows for my team?",
    answer:
      "Yes. You can require manager approval for specific team members or platforms before any post goes live. Approvers get notified via email or Slack.",
  },
  {
    question: "What analytics do I get?",
    answer:
      "You get a unified dashboard showing cross-platform engagement, click-through rates, and audience demographics. We also provide AI-driven insights on the best times to post for your specific audience.",
  },
  {
    question: "Can I connect my existing CRM?",
    answer:
      "Yes. We have native, bidirectional integrations with Salesforce, HubSpot, Pipedrive, and 200+ other tools. Data stays in sync automatically — no manual exports required.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. Marketme is SOC2 Type II certified. All data is encrypted at rest and in transit using AES-256. We never sell or share your data with third parties.",
  },
  {
    question: "How long does it take to set up?",
    answer:
      "Most teams are fully operational within 15 minutes. Connect your data sources, import your leads, and your first automation can be live the same day. No engineering resources needed.",
  },
];

export function FaqSection() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 py-24 z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-start">
        
        {/* Left Column - Questions */}
        <div className="md:col-span-2">
          <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tighter text-white mb-10 leading-tight">
            Frequently asked <span className="font-serif italic font-medium text-blue-400">questions</span>
          </h2>

          <Accordion className="w-full space-y-0">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/8 last:border-b-0">
                <AccordionTrigger className="text-sm md:text-base text-white/70 hover:text-white/90 transition-colors duration-200 pr-4 font-light hover:no-underline py-5 text-left [&[data-state=open]>svg]:text-blue-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-white/45 leading-relaxed pb-5 max-w-lg">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Right Column - Sidebar Card */}
        <div className="md:col-span-1 pt-2 md:pt-24">
          <div className="bg-white/4 border border-white/8 rounded-2xl p-6 md:p-8 backdrop-blur-sm sticky top-24">
            <h3 className="text-lg font-serif font-medium text-white mb-3">Still have questions?</h3>
            <p className="text-sm text-white/40 leading-relaxed mb-8">
              Our team typically replies in under 2 hours.
            </p>
            
            <Button 
              className="w-full bg-white text-black hover:bg-white/90 rounded-full h-12 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] border-0 mb-6"
            >
              Chat with us &rarr;
            </Button>

            <div className="pt-6 border-t border-white/8 flex items-center justify-center gap-2 text-xs font-medium text-white/50 tracking-wide">
              <span className="text-yellow-500">⭐</span> 4.8 / 5 average support rating
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
