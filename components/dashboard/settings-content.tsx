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
    transition: { staggerChildren: 0.08 }
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
      className="max-w-6xl mx-auto px-6 py-10 relative z-10"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Settings.</h1>
        <p className="text-white/40 mt-2 text-base">Manage your workspace preferences and configurations.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Side nav */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-1">
          {[
            { label: 'General', icon: MonitorSmartphone, active: true },
            { label: 'Security', icon: Shield },
            { label: 'Notifications', icon: Bell },
            { label: 'Billing', icon: CreditCard },
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full justify-start font-medium rounded-xl h-11 transition-all text-sm ${
                item.active
                  ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/15 hover:text-blue-300'
                  : 'text-white/45 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4 mr-3 shrink-0" />
              {item.label}
            </Button>
          ))}
        </motion.div>

        {/* Main settings */}
        <div className="lg:col-span-3 space-y-5">
          <motion.div variants={itemVariants}>
            <Card className="bg-white/4 backdrop-blur-xl border-white/8 text-white shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/6 pb-5 pt-6 px-7 bg-white/2">
                <CardTitle className="text-base font-bold text-white">Workspace Profile</CardTitle>
                <CardDescription className="text-white/40 text-sm mt-1">
                  This is your workspace&apos;s visible name and domain.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-7 space-y-5">
                <div className="space-y-2 max-w-lg">
                  <Label className="text-white/50 font-medium text-xs uppercase tracking-wider">Workspace Name</Label>
                  <Input
                    defaultValue="Vanguard Atelier"
                    className="h-11 bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-white rounded-xl shadow-none"
                  />
                </div>
                <div className="space-y-2 max-w-lg">
                  <Label className="text-white/50 font-medium text-xs uppercase tracking-wider">Workspace Domain</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      defaultValue="vanguard"
                      className="h-11 bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-white rounded-xl shadow-none"
                    />
                    <span className="text-white/30 font-medium shrink-0 text-sm">.marketme.io</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/4 backdrop-blur-xl border-white/8 text-white shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/6 pb-5 pt-6 px-7 bg-white/2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-bold text-white">Auto-Reply Configuration</CardTitle>
                  <CardDescription className="text-white/40 text-sm mt-1">
                    Manage automated responses to inbound leads.
                  </CardDescription>
                </div>
                {/* Toggle */}
                <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-blue-500 transition-colors duration-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5 shadow-inner" />
                </div>
              </CardHeader>
              <CardContent className="p-7 space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/4 border border-white/8">
                  <Mailbox className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white text-sm mb-1">Standard Greeting</h4>
                    <p className="text-xs text-white/40 leading-relaxed">
                      Automatically replies to new leads acknowledging their inquiry and estimating response time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="h-11 px-8 bg-white text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-shadow flex items-center justify-center text-sm"
            >
              Save Changes
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
