'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Target, BarChart3, Zap } from "lucide-react";

export function BentoFeatures() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-12 z-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Everything you need. <br />
          <span className="text-zinc-500">Nothing you don't.</span>
        </h2>
        <p className="text-zinc-400 text-lg">A suite of tools designed to feel like magic, engineered to perform like a machine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Card */}
        <Card className="md:col-span-2 bg-zinc-900/50 border-zinc-800 text-white overflow-hidden relative group backdrop-blur-sm">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 border border-zinc-700">
               <Share2 className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Omnichannel Workflows</CardTitle>
            <CardDescription className="text-zinc-400 text-base">
              Launch coordinated campaigns across email, SMS, and social media from a single drag-and-drop canvas.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-8 flex gap-4 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity duration-500">
             {/* Mock UI Elements replacing SVG */}
             <div className="flex flex-col gap-3 min-w-[200px]">
               <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center"><Zap className="w-3 h-3 text-emerald-500" /></div>
                  <div className="h-2 w-20 bg-zinc-600 rounded-full" />
               </div>
               <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg flex items-center gap-3 translate-x-4">
                  <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center"><Target className="w-3 h-3 text-zinc-400" /></div>
                  <div className="h-2 w-16 bg-zinc-600 rounded-full" />
               </div>
             </div>
             <div className="flex items-center">
                <div className="w-16 border-t-2 border-zinc-700 border-dashed" />
             </div>
             <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl flex-1 max-w-[250px]">
                <div className="h-2 w-24 bg-zinc-500 rounded-full mb-4" />
                <div className="space-y-2">
                   <div className="h-2 w-full bg-zinc-700 rounded-full" />
                   <div className="h-2 w-4/5 bg-zinc-700 rounded-full" />
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Small Card */}
        <Card className="bg-zinc-900/50 border-zinc-800 text-white backdrop-blur-sm group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 border border-zinc-700">
               <Target className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle className="text-xl">Smart Routing</CardTitle>
            <CardDescription className="text-zinc-400">
              Automatically score and route new leads based on engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
             <div className="w-24 h-24 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full border-4 border-zinc-700 flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                </div>
                <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
             </div>
          </CardContent>
        </Card>

        {/* Horizontal Card */}
        <Card className="md:col-span-3 bg-zinc-900/50 border-zinc-800 text-white backdrop-blur-sm flex flex-col md:flex-row items-center overflow-hidden group">
          <div className="md:w-1/2">
            <CardHeader>
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 border border-zinc-700">
                 <BarChart3 className="w-6 h-6 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl">Predictive Analytics</CardTitle>
              <CardDescription className="text-zinc-400 text-base max-w-sm">
                Stop guessing. See exactly which channels drive revenue and let AI suggest budget re-allocations in real-time.
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="md:w-1/2 p-6 w-full">
            <div className="w-full h-48 bg-zinc-950 rounded-xl border border-zinc-800 p-4 flex items-end gap-2 shadow-inner">
               {[30, 50, 40, 80, 60, 100, 75].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500/20 rounded-t border-t border-emerald-500/50 group-hover:bg-emerald-500/40 transition-colors" style={{ height: `${h}%` }} />
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
