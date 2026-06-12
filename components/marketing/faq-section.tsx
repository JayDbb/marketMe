"use client"

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How does pricing work for teams?",
    answer:
      "Marketme pricing scales with your team size. Every plan includes unlimited campaigns and lead routing. You only pay for the active contacts you manage each month — no hidden fees, no seat charges.",
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 py-20 z-10">
      <div className="max-w-2xl">
        <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tighter text-white mb-12 leading-tight">
          Frequently asked questions
        </h2>

        <div className="space-y-0">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border-b border-white/8 last:border-b-0">
                <button
                  id={`faq-btn-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="text-sm md:text-base text-white/70 group-hover:text-white/90 transition-colors duration-200 pr-4 font-light">
                    {faq.question}
                  </span>
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-white/15 group-hover:border-blue-400/40 transition-colors duration-200">
                    {isOpen ? (
                      <Minus className="w-3 h-3 text-blue-400" />
                    ) : (
                      <Plus className="w-3 h-3 text-white/50" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      role="region"
                      aria-labelledby={`faq-btn-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-white/45 leading-relaxed pb-5 max-w-lg">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
