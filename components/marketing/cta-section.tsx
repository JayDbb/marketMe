"use client"

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 py-20 pb-32 z-10">
      <div className="relative rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden p-8 md:p-14">
        {/* Background glow */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-700/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16">
          {/* Decorative 3D-like sphere — left side of CTA (matches reference) */}
          <div className="shrink-0 hidden md:block" aria-hidden="true">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_25%,rgba(140,160,255,0.7)_0%,rgba(60,80,200,0.8)_40%,rgba(20,30,100,0.95)_80%)]" />
              <div className="absolute top-[12%] left-[22%] w-[30%] h-[14%] rounded-full bg-white/25 blur-sm rotate-[-15deg]" />
              {/* Pie chart-like overlay */}
              <div className="absolute inset-[18%] rounded-full border-2 border-blue-300/20" />
              <div className="absolute inset-[30%] rounded-full bg-blue-200/10" />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl md:text-4xl font-serif font-light tracking-tighter text-white mb-3 leading-tight">
              Get instant access
            </h2>
            <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-sm">
              Celebrate the joy of accomplishment with an app designed to track your progress and motivate your efforts.
            </p>

            {submitted ? (
              <p className="text-sm text-blue-300 font-medium">
                You&apos;re on the list — we&apos;ll be in touch soon.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 max-w-sm"
              >
                <label htmlFor="cta-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="flex-1 h-10 rounded-lg bg-white/8 border border-white/12 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-white/90 active:scale-[0.97] transition-all duration-150 shrink-0"
                >
                  Get access
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Decorative gear icon — right side (matches reference) */}
          <div className="shrink-0 hidden md:flex items-center justify-center" aria-hidden="true">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_35%_25%,rgba(140,160,255,0.5)_0%,rgba(50,70,180,0.7)_50%,rgba(15,20,80,0.95)_100%)]" />
              <div className="absolute top-[10%] left-[20%] w-[28%] h-[12%] rounded-full bg-white/20 blur-[2px] rotate-[-15deg]" />
              {/* Gear teeth simulation */}
              <svg
                className="absolute inset-0 w-full h-full opacity-30"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40 15 L44 5 L36 5 Z M40 65 L44 75 L36 75 Z M15 40 L5 44 L5 36 Z M65 40 L75 44 L75 36 Z"
                  fill="rgba(140,160,255,0.6)"
                />
                <circle cx="40" cy="40" r="14" stroke="rgba(140,160,255,0.4)" strokeWidth="1.5" fill="none" />
                <circle cx="40" cy="40" r="7" stroke="rgba(140,160,255,0.3)" strokeWidth="1" fill="none" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
