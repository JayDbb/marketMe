'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LayoutDashboard, Users, Link2, Sparkles } from 'lucide-react'
import { UpgradeModal } from './upgrade-modal'
import { InvoicesDrawer } from './invoices-drawer'

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
}

export function BillingContent() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isInvoicesDrawerOpen, setIsInvoicesDrawerOpen] = useState(false)

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Billing</h3>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsUpgradeModalOpen(true)}
            className="h-10 bg-transparent border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-white dark:bg-white/5 font-medium rounded-xl"
          >
            View all plans
          </Button>
          <Button 
            onClick={() => setIsUpgradeModalOpen(true)}
            className="h-10 bg-white text-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/90 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
          >
            Manage plan
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsInvoicesDrawerOpen(true)}
            className="h-10 bg-transparent border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-white dark:bg-white/5 font-medium rounded-xl"
          >
            View invoices
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-xl dark:border-white/8 text-zinc-900 dark:text-white shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Free</h2>
            <p className="text-sm text-zinc-500 dark:text-white/40">For those starting out on socials.</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">$0 <span className="text-sm font-normal text-zinc-500 dark:text-white/40">/ month</span></div>
            <p className="text-xs text-zinc-500 dark:text-white/30">No renewal on this plan</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <div>
        <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-4 mt-8">Usage</h4>
        <Card className="bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-xl dark:border-white/8 text-zinc-900 dark:text-white shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-white/5">
            {/* Workspaces */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white mb-1">
                  <LayoutDashboard className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                  Workspaces
                </div>
                <p className="text-xs text-zinc-500 dark:text-white/40">Workspaces allow you to split your work into groups (by client, by channels, etc).</p>
              </div>
              <div className="w-full md:w-[300px]">
                <div className="flex justify-between text-xs text-zinc-500 dark:text-white/50 mb-2">
                  <span className="flex items-center gap-1"><LayoutDashboard className="w-3 h-3" /> 1 (100%)</span>
                  <span className="flex items-center gap-1"><LayoutDashboard className="w-3 h-3" /> 1</span>
                </div>
                <Progress value={100} className="h-3 bg-white dark:bg-white/10 border-zinc-200 [&>div]:bg-white/30" />
              </div>
            </div>

            {/* Users */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white mb-1">
                  <Users className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                  Users
                </div>
                <p className="text-xs text-zinc-500 dark:text-white/40">Total number of team members you can invite across all workspaces.</p>
              </div>
              <div className="w-full md:w-[300px]">
                <div className="flex justify-between text-xs text-zinc-500 dark:text-white/50 mb-2">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1 (100%)</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 1</span>
                </div>
                <Progress value={100} className="h-3 bg-white dark:bg-white/10 border-zinc-200 [&>div]:bg-white/30" />
              </div>
            </div>

            {/* Social Profiles */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white mb-1">
                  <Link2 className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                  Social profiles
                </div>
                <p className="text-xs text-zinc-500 dark:text-white/40">Total number of unique social profiles you can connect across all workspaces.</p>
              </div>
              <div className="w-full md:w-[300px]">
                <div className="flex justify-between text-xs text-zinc-500 dark:text-white/50 mb-2">
                  <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> 0 (0%)</span>
                  <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> 1</span>
                </div>
                <Progress value={0} className="h-3 bg-white dark:bg-white/10 border-zinc-200 [&>div]:bg-blue-500" />
              </div>
            </div>

            {/* Credits */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white mb-1">
                  <Sparkles className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                  Credits
                </div>
                <p className="text-xs text-zinc-500 dark:text-white/40">Used for AI generation, automation runs, and publishing actions. Resets monthly.</p>
              </div>
              <div className="w-full md:w-[300px]">
                <div className="flex justify-between text-xs text-zinc-500 dark:text-white/50 mb-2">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> 0 (0%)</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Unlimited</span>
                </div>
                <Progress value={0} className="h-3 bg-white dark:bg-white/10 border-zinc-200 [&>div]:bg-blue-500" />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
      <InvoicesDrawer open={isInvoicesDrawerOpen} onOpenChange={setIsInvoicesDrawerOpen} />
    </motion.div>
  )
}
