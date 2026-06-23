'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Sparkles, CalendarDays, CheckCircle2, Camera, Briefcase, MessageSquare, Plus } from 'lucide-react';

const steps = [
  { 
    id: 0,
    number: "01", 
    title: "Connect your platforms", 
    detail: "Link Twitter, LinkedIn, Instagram in one click.",
    icon: Link2
  },
  { 
    id: 1,
    number: "02", 
    title: "Create or generate", 
    detail: "Write your own or let AI draft it for you.",
    icon: Sparkles
  },
  { 
    id: 2,
    number: "03", 
    title: "Schedule and relax", 
    detail: "Set your calendar and we handle the rest.",
    icon: CalendarDays
  }
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 bg-transparent border-t border-white/8">
      <div className="max-w-5xl mx-auto px-6 space-y-16">
        
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-light text-white tracking-tight leading-tight">
            How it <span className="font-serif italic font-medium text-blue-400">works</span>
          </h2>
        </div>

        <div className="space-y-8">
          {/* Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`text-left rounded-2xl p-6 transition-all duration-300 border ${
                    isActive 
                      ? 'bg-blue-400/10 border-blue-400/50 shadow-[0_0_30px_rgba(96,165,250,0.1)]' 
                      : 'bg-white/4 border-white/8 hover:bg-white/6 hover:border-white/12'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center">
                        <step.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-white/60'}`} />
                      </div>
                      <span className={`text-xs tracking-widest font-mono ${isActive ? 'text-blue-400' : 'text-white/30'}`}>
                        {step.number}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-medium text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview Panel */}
          <div className="relative w-full rounded-2xl bg-white/4 backdrop-blur-sm border border-white/8 overflow-hidden">
            {/* macOS Title Bar */}
            <div className="h-10 border-b border-white/8 bg-black/20 flex items-center px-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 text-[10px] text-white/30 font-medium tracking-wide">
                marketme.app
              </div>
            </div>

            {/* Content Area */}
            <div className="relative h-[300px] bg-[#0d1117]/50 overflow-hidden flex items-center justify-center p-6">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg"
                  >
                    {[
                      { icon: MessageSquare, name: 'Twitter / X', connected: true },
                      { icon: Briefcase, name: 'LinkedIn', connected: true },
                      { icon: Camera, name: 'Instagram', connected: true },
                      { icon: Plus, name: 'TikTok', connected: false },
                      { icon: Plus, name: 'Facebook', connected: false },
                      { icon: Plus, name: 'Add More', dashed: true }
                    ].map((platform, i) => (
                      <div key={i} className={`relative p-5 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group ${
                        platform.dashed ? 'border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5' : 
                        platform.connected ? 'bg-white/5 border border-white/10 hover:bg-white/10 shadow-lg' : 'opacity-50 hover:opacity-100'
                      }`}>
                        {platform.icon && (
                          <platform.icon 
                            className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                              platform.connected ? 'text-white' : 'text-white/40'
                            }`} 
                          />
                        )}
                        <span className={`text-[10px] uppercase tracking-widest font-medium ${platform.connected ? 'text-white/80' : 'text-white/40'}`}>
                          {platform.name}
                        </span>
                        {platform.connected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 absolute top-2.5 right-2.5 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-lg bg-[#1c2128] border border-[#30363d] rounded-xl p-4 shadow-2xl flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> AI Composer
                    </div>
                    <div className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] text-sm text-white/80 leading-relaxed min-h-[100px]">
                      Just deployed the new landing page for Marketme! 🚀<br/><br/>
                      Built entirely on the new dark-theme design system. The glassmorphism and bento grids are incredibly smooth.<br/><br/>
                      <span className="text-blue-400">#buildinpublic #nextjs #webdesign</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 px-3 rounded bg-blue-500/20 text-blue-400 text-xs flex items-center border border-blue-500/30">Twitter</div>
                      <div className="h-8 px-3 rounded bg-white/5 text-white/40 text-xs flex items-center border border-white/10">LinkedIn</div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-2xl bg-[#1c2128] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl flex flex-col"
                  >
                    <div className="h-10 border-b border-[#30363d] flex items-center justify-between px-4 text-xs">
                      <span className="text-white/40">Calendar View</span>
                      <span className="text-blue-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/> Next publish in 2h 14m</span>
                    </div>
                    <div className="grid grid-cols-5 divide-x divide-[#30363d] h-[200px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[100%_40px]">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                        <div key={day} className="p-2 relative flex flex-col gap-2">
                          <span className="text-[9px] text-white/30 uppercase tracking-widest">{day}</span>
                          {i === 0 && <div className="h-10 rounded bg-emerald-500/20 border border-emerald-500/30 w-full" />}
                          {i === 1 && <div className="h-10 rounded bg-blue-500/20 border border-blue-500/30 w-full" />}
                          {i === 3 && <div className="h-10 rounded bg-purple-500/20 border border-purple-500/30 w-full" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
