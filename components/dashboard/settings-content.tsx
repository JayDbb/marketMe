'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell, CreditCard, Shield, MonitorSmartphone, Mailbox } from 'lucide-react'

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

export function SettingsContent() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-12 relative z-10"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Settings.</h1>
        <p className="text-zinc-400 mt-3 text-lg">Manage your workspace preferences and configurations.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar for Settings */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 font-medium rounded-xl h-12 transition-all">
            <MonitorSmartphone className="w-5 h-5 mr-3" />
            General
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl h-12 transition-all">
            <Shield className="w-5 h-5 mr-3" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl h-12 transition-all">
            <Bell className="w-5 h-5 mr-3" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl h-12 transition-all">
            <CreditCard className="w-5 h-5 mr-3" />
            Billing
          </Button>
        </motion.div>

        {/* Main Settings Area */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 pb-6 pt-8 px-8 bg-zinc-900/20">
                <CardTitle className="text-xl font-bold text-white">Workspace Profile</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-1">
                  This is your workspace&apos;s visible name and domain.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3 max-w-lg">
                  <Label className="text-zinc-300 font-medium text-sm">Workspace Name</Label>
                  <Input 
                    defaultValue="Vanguard Atelier"
                    className="h-12 bg-zinc-950/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white rounded-xl shadow-inner"
                  />
                </div>
                
                <div className="space-y-3 max-w-lg">
                  <Label className="text-zinc-300 font-medium text-sm">Workspace Domain</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      defaultValue="vanguard"
                      className="h-12 bg-zinc-950/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white rounded-xl shadow-inner"
                    />
                    <span className="text-zinc-500 font-medium shrink-0">.marketme.io</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 pb-6 pt-8 px-8 bg-zinc-900/20 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl font-bold text-white">Auto-Reply Configuration</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm mt-1">
                    Manage automated responses to inbound leads.
                  </CardDescription>
                </div>
                {/* Custom Toggle Switch using Tailwind */}
                <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="h-6 w-11 rounded-full bg-zinc-700 peer-checked:bg-emerald-500 transition-colors duration-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5 shadow-inner"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                    <Mailbox className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white mb-1">Standard Greeting</h4>
                      <p className="text-sm text-zinc-400">Automatically replies to new leads acknowledging their inquiry and estimating response time.</p>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4 flex justify-end">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="h-12 px-8 bg-white text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-shadow flex items-center justify-center"
            >
              Save Changes
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
