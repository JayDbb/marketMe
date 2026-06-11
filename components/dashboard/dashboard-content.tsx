'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LayoutDashboard, Settings, User, MessageSquare, Send, Sparkles, Target, Briefcase, TrendingUp } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
}

interface DashboardContentProps {
  submitFeedbackAction: (formData: FormData) => void;
}

export function DashboardContent({ submitFeedbackAction }: DashboardContentProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-12 relative z-10"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Welcome back.</h1>
        <p className="text-zinc-400 mt-3 text-lg">Here is your workspace overview for today.</p>
      </motion.div>

      {/* Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Business Profile Summary (Span 2) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 shadow-xl rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-zinc-400 tracking-tight uppercase">Active Profile</CardTitle>
                  <h2 className="text-3xl font-bold text-white mt-1">Vanguard Atelier</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                  <Briefcase className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Target className="w-4 h-4" />
                    Target Audience
                  </div>
                  <p className="font-medium text-white">High-Net-Worth Individuals</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Current Strategy
                  </div>
                  <p className="font-medium text-emerald-400">Aggressive Growth</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-zinc-800/50">
                <p className="text-sm text-zinc-500">
                  Profile completeness: <span className="text-zinc-300 font-medium">92%</span> — ready for automated campaigns.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generate Content Action (Span 1) */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-zinc-900/60 backdrop-blur-2xl border-zinc-800/60 text-zinc-50 shadow-2xl rounded-3xl overflow-hidden relative flex flex-col items-center justify-center p-8 text-center group">
            {/* Liquid Glass Refraction Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-3xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
              <Sparkles className="h-8 w-8 text-emerald-500" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Weekly Content</h3>
            <p className="text-sm text-zinc-400 mb-8 max-w-[200px]">
              Generate optimized social posts and emails for Vanguard Atelier.
            </p>
            
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 px-6 bg-white text-zinc-950 font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-shadow duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Now
            </motion.button>
          </Card>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        <motion.div variants={itemVariants}>
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 hover:bg-zinc-900/60 transition-colors shadow-xl rounded-3xl overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-tight">Total Leads</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                <User className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <div className="text-4xl font-mono font-bold text-white tracking-tight">1,234</div>
              <p className="text-xs text-emerald-400 bg-emerald-500/10 inline-flex px-2 py-1 rounded-md mt-4 font-medium border border-emerald-500/20">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 hover:bg-zinc-900/60 transition-colors shadow-xl rounded-3xl overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-tight">Active Campaigns</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <div className="text-4xl font-mono font-bold text-white tracking-tight">12</div>
              <p className="text-xs text-emerald-400 bg-emerald-500/10 inline-flex px-2 py-1 rounded-md mt-4 font-medium border border-emerald-500/20">
                +3 new this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 hover:bg-zinc-900/60 transition-colors shadow-xl rounded-3xl overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-tight">Automation Health</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                <Settings className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
              <div className="text-4xl font-mono font-bold text-emerald-400 tracking-tight">99.9%</div>
              <p className="text-xs text-zinc-500 mt-4 font-medium">
                All systems running normally
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feedback Section */}
      <motion.div variants={itemVariants} className="mt-16">
        <Card className="bg-zinc-900/60 backdrop-blur-2xl border-zinc-800/60 text-zinc-50 max-w-2xl shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-900/40 border-b border-zinc-800/50 pb-6 pt-8 px-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
              </div>
              Submit Feedback
            </CardTitle>
            <CardDescription className="text-zinc-400 text-base mt-2">
              Found a bug or have a feature request? Let us know, and it will be sent directly to our Linear engineering board.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form action={submitFeedbackAction} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-zinc-300 font-medium text-sm">Issue Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="e.g., Campaign analytics are not updating" 
                  required 
                  className="h-12 bg-zinc-950/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-zinc-300 font-medium text-sm">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Please provide steps to reproduce or details about your feature request..." 
                  required 
                  className="bg-zinc-950/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 min-h-[140px] text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner resize-y p-4"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] border-0 transition-all flex items-center justify-center gap-2 mt-2">
                <Send className="w-4 h-4" />
                Submit to Linear
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
