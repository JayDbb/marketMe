'use client'

import { motion, Variants } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LayoutDashboard, Settings, User, MessageSquare, Send, Sparkles, Target, Briefcase, TrendingUp, Loader2 } from 'lucide-react'
import type { BusinessProfile } from '@/types/business-profile'
import { generateContentAction } from '@/app/dashboard/actions'
import { useState } from 'react'
import { OnboardingChecklist, type OnboardingState } from '@/components/dashboard/onboarding-checklist'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
}

interface DashboardContentProps {
  submitFeedbackAction: (formData: FormData) => void;
  profile: BusinessProfile | null;
  plansCount: number;
  postsCount: number;
  socialConnected?: boolean;
}

export function DashboardContent({ submitFeedbackAction, profile, plansCount, postsCount, socialConnected = false }: DashboardContentProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const businessName = profile?.business_name || "Welcome";
  const targetAudience = profile?.target_customers || "Not Set";
  const currentStrategy = profile?.primary_goal || "Not Set";
  const isProfileComplete = profile ? true : false;

  const onboardingState: OnboardingState = {
    profileComplete: isProfileComplete,
    socialConnected,
    contentGenerated: plansCount > 0,
    firstPostCreated: postsCount > 0,
    firstPostScheduled: postsCount > 0,
  };
  
  const handleGenerate = async () => {
    if (!profile) {
      alert('Please complete your profile first!');
      return;
    }
    setIsGenerating(true);
    const result = await generateContentAction(profile.id);
    if (result?.error) {
      alert(result.error);
    }
    setIsGenerating(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 py-10 relative z-10"
    >
      {/* Beta Onboarding Checklist */}
      <motion.div variants={itemVariants}>
        <OnboardingChecklist state={onboardingState} />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-10 w-full">
        <div className="flex flex-col items-center text-center mb-8 pt-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">Plan your next post</h1>
          <p className="text-zinc-500 dark:text-white/40 mt-2 text-base max-w-lg">
            Draft the caption, add creatives, choose profiles, and schedule the publishing window using our AI.
          </p>
        </div>

        <Card className="bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-2xl dark:border-white/8 text-zinc-900 dark:text-white shadow-2xl rounded-2xl overflow-hidden relative max-w-3xl mx-auto p-2 group">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 ml-1">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <Input
              placeholder="Describe your business and generate a post with AI..."
              className="flex-1 h-12 bg-transparent border-0 focus-visible:ring-0 text-zinc-900 placeholder:text-zinc-500 dark:text-white/30 text-base shadow-none"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !isProfileComplete}
              className="h-10 px-6 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/90 transition-all font-bold tracking-wide shrink-0 disabled:opacity-50 gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'New post'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Business Profile Summary (Span 2) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-xl dark:border-white/8 text-zinc-900 dark:text-white shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-medium text-zinc-500 dark:text-white/40 tracking-widest uppercase">Active Profile</CardTitle>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{businessName}</h2>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/6 border-zinc-200 flex items-center justify-center border dark:border-white/8">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 gap-6 mt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-white/40 text-xs">
                    <Target className="w-3.5 h-3.5" />
                    Target Audience
                  </div>
                  <p className="font-medium text-zinc-900 dark:text-white text-sm">{targetAudience}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-white/40 text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Current Strategy
                  </div>
                  <p className="font-medium text-blue-400 text-sm">{currentStrategy}</p>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-white/6">
                <p className="text-xs text-zinc-500 dark:text-white/30">
                  Profile completeness: <span className="text-zinc-500 dark:text-white/60 font-medium">{isProfileComplete ? '100%' : 'Incomplete'}</span> — {isProfileComplete ? 'ready for automated campaigns.' : 'please finish setup.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generate Content Action */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-2xl dark:border-white/8 text-zinc-900 dark:text-white shadow-2xl rounded-2xl overflow-hidden relative flex flex-col items-center justify-center p-7 text-center group">
            <div className="absolute inset-0 rounded-2xl border border-zinc-200 dark:border-white/5 pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-2xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-blue-500/12 flex items-center justify-center border border-blue-500/20 mb-5 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
              <Sparkles className="h-7 w-7 text-blue-400" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Weekly Content</h3>
            <p className="text-xs text-zinc-500 dark:text-white/40 mb-7 max-w-[180px] leading-relaxed">
              Generate optimized social posts and emails for {businessName}.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={isGenerating || !isProfileComplete}
              className="w-full py-3 px-5 bg-white text-zinc-950 font-bold rounded-xl shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-15px_rgba(255,255,255,0.5)] transition-shadow duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate Now'}
            </motion.button>
          </Card>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-5 md:grid-cols-3 mb-12">
        {[
          {
            label: 'Total Posts',
            value: postsCount.toString(),
            badge: `${postsCount > 0 ? '+3 new this week' : 'No posts yet'}`,
            icon: MessageSquare,
          },
          {
            label: 'Content Plans',
            value: plansCount.toString(),
            badge: `${plansCount > 0 ? 'Active schedule' : 'Needs generation'}`,
            icon: LayoutDashboard,
          },
          {
            label: 'Automation Health',
            value: 'Online',
            badge: 'All systems normal',
            icon: Settings,
            valueClass: 'text-blue-400',
            badgeNeutral: true,
          },
        ].map((metric) => (
          <motion.div variants={itemVariants} key={metric.label}>
            <Card className="bg-white dark:hover:bg-white/4 border-zinc-200 backdrop-blur-xl dark:border-white/8 text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-white/6 transition-colors shadow-xl rounded-2xl overflow-hidden relative group h-full">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-xs font-medium text-zinc-500 dark:text-white/40 uppercase tracking-widest">{metric.label}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/6 border-zinc-200 flex items-center justify-center border dark:border-white/8">
                  <metric.icon className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div className={`text-3xl font-mono font-bold tracking-tight ${metric.valueClass ?? 'text-zinc-900 dark:text-white'}`}>
                  {metric.value}
                </div>
                <p className={`text-xs inline-flex px-2 py-1 rounded-lg mt-3 font-medium border ${
                  metric.badgeNeutral
                    ? 'bg-white dark:bg-white/5 border-zinc-200 text-zinc-500 dark:text-white/40  dark:border-white/8'
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
        <Card className="bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-2xl dark:border-white/8 text-zinc-900 dark:text-white max-w-2xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white dark:bg-white/3 border-zinc-200 border-b dark:border-white/6 pb-5 pt-7 px-7">
            <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              <div className="p-2 bg-blue-500/12 rounded-lg border border-blue-500/20">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              Submit Feedback
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-white/40 text-sm mt-2">
              Found a bug or have a feature request? Sent directly to our Linear engineering board.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-7">
            <form action={submitFeedbackAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-500 dark:text-white/50 font-medium text-xs uppercase tracking-wider">Issue Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Campaign analytics are not updating"
                  required
                  className="h-11 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 placeholder:text-zinc-500 dark:text-white/20 rounded-xl transition-all shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-500 dark:text-white/50 font-medium text-xs uppercase tracking-wider">Detailed Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide steps to reproduce or details about your feature request..."
                  required
                  className="bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 min-h-[120px] text-zinc-900 placeholder:text-zinc-500 dark:text-white/20 rounded-xl transition-all shadow-none resize-y p-4"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-500 hover:bg-blue-400 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] border-0 transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
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
