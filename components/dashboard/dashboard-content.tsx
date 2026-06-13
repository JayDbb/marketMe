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
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
}

import { useState } from 'react'

interface DashboardContentProps {
  submitFeedbackAction: (formData: FormData) => void;
  profile?: any;
}

export function DashboardContent({ submitFeedbackAction, profile }: DashboardContentProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleGenerate = async () => {
    if (!profile) return;
    
    setIsGenerating(true);
    setGenerateStatus('idle');
    
    try {
      const res = await fetch('/api/content-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: profile.id,
          startDate: new Date().toISOString(),
        })
      });
      
      if (!res.ok) throw new Error('Failed to generate');
      
      setGenerateStatus('success');
      setTimeout(() => setGenerateStatus('idle'), 3000);
    } catch (err) {
      setGenerateStatus('error');
    } finally {
      setIsGenerating(false);
    }
  }
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 py-10 relative z-10"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Welcome back.</h1>
        <p className="text-white/40 mt-2 text-base">Here is your workspace overview for today.</p>
      </motion.div>

      {/* Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Business Profile Summary (Span 2) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-white/4 backdrop-blur-xl border-white/8 text-white shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-medium text-white/40 tracking-widest uppercase">Active Profile</CardTitle>
                  <h2 className="text-2xl font-bold text-white mt-1">{profile?.business_name || 'Complete Your Profile'}</h2>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/6 flex items-center justify-center border border-white/8">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 gap-6 mt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Target className="w-3.5 h-3.5" />
                    Target Audience
                  </div>
                  <p className="font-medium text-white text-sm line-clamp-1">{profile?.target_audience || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Brand Voice
                  </div>
                  <p className="font-medium text-blue-400 text-sm line-clamp-1">{profile?.brand_voice || 'Not specified'}</p>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-white/6">
                <p className="text-xs text-white/30">
                  Profile completeness: <span className="text-white/60 font-medium">92%</span> — ready for automated campaigns.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generate Content Action */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white/4 backdrop-blur-2xl border-white/8 text-white shadow-2xl rounded-2xl overflow-hidden relative flex flex-col items-center justify-center p-7 text-center group">
            <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-2xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-blue-500/12 flex items-center justify-center border border-blue-500/20 mb-5 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
              <Sparkles className="h-7 w-7 text-blue-400" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Weekly Content</h3>
            <p className="text-xs text-white/40 mb-7 max-w-[180px] leading-relaxed">
              Generate optimized social posts and emails for {profile?.business_name || 'your business'}.
            </p>

            <motion.button
              whileTap={{ scale: profile && !isGenerating ? 0.97 : 1 }}
              onClick={handleGenerate}
              disabled={!profile || isGenerating}
              className={`w-full py-3 px-5 font-bold rounded-xl shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                !profile ? 'bg-white/10 text-white/40 cursor-not-allowed' :
                generateStatus === 'success' ? 'bg-green-500 text-white shadow-[0_0_50px_-15px_rgba(34,197,94,0.5)]' :
                generateStatus === 'error' ? 'bg-red-500 text-white' :
                'bg-white text-zinc-950 hover:shadow-[0_0_50px_-15px_rgba(255,255,255,0.5)]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                  Generating...
                </>
              ) : generateStatus === 'success' ? (
                'Job Triggered!'
              ) : generateStatus === 'error' ? (
                'Failed to Start'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Now
                </>
              )}
            </motion.button>
          </Card>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-5 md:grid-cols-3 mb-12">
        {[
          {
            label: 'Total Leads',
            value: '1,234',
            badge: '+20.1% from last month',
            icon: User,
          },
          {
            label: 'Active Campaigns',
            value: '12',
            badge: '+3 new this week',
            icon: LayoutDashboard,
          },
          {
            label: 'Automation Health',
            value: '99.9%',
            badge: 'All systems normal',
            icon: Settings,
            valueClass: 'text-blue-400',
            badgeNeutral: true,
          },
        ].map((metric) => (
          <motion.div variants={itemVariants} key={metric.label}>
            <Card className="bg-white/4 backdrop-blur-xl border-white/8 text-white hover:bg-white/6 transition-colors shadow-xl rounded-2xl overflow-hidden relative group h-full">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-xs font-medium text-white/40 uppercase tracking-widest">{metric.label}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-white/6 flex items-center justify-center border border-white/8">
                  <metric.icon className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className={`text-3xl font-mono font-bold tracking-tight ${metric.valueClass ?? 'text-white'}`}>
                  {metric.value}
                </div>
                <p className={`text-xs inline-flex px-2 py-1 rounded-lg mt-3 font-medium border ${
                  metric.badgeNeutral
                    ? 'bg-white/5 text-white/40 border-white/8'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {metric.badge}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Feedback Section */}
      <motion.div variants={itemVariants} id="feedback">
        <Card className="bg-white/4 backdrop-blur-2xl border-white/8 text-white max-w-2xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white/3 border-b border-white/6 pb-5 pt-7 px-7">
            <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-white">
              <div className="p-2 bg-blue-500/12 rounded-lg border border-blue-500/20">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              Submit Feedback
            </CardTitle>
            <CardDescription className="text-white/40 text-sm mt-2">
              Found a bug or have a feature request? Sent directly to our Linear engineering board.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-7">
            <form action={submitFeedbackAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/50 font-medium text-xs uppercase tracking-wider">Issue Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Campaign analytics are not updating"
                  required
                  className="h-11 bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-white placeholder:text-white/20 rounded-xl transition-all shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/50 font-medium text-xs uppercase tracking-wider">Detailed Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide steps to reproduce or details about your feature request..."
                  required
                  className="bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 min-h-[120px] text-white placeholder:text-white/20 rounded-xl transition-all shadow-none resize-y p-4"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] border-0 transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
              >
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
