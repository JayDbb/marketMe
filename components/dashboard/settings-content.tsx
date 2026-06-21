'use client'

import { useState, useTransition, useEffect } from 'react'
import { motion, Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Users, CreditCard, LayoutDashboard, Calendar, Code, UploadCloud, Loader2 } from 'lucide-react'
import { BillingContent } from './billing-content'
import { updateProfileAction } from '@/app/dashboard/settings/actions'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
}

const navSections = [
  {
    title: 'Account',
    items: [
      { label: 'Settings', icon: Settings },
      { label: 'Team', icon: Users },
    ]
  },
  {
    title: 'Subscription',
    items: [
      { label: 'Billing', icon: CreditCard },
    ]
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Workspace', icon: LayoutDashboard },
      { label: 'Calendar', icon: Calendar },
    ]
  },
  {
    title: 'Developers',
    items: [
      { label: 'API', icon: Code },
    ]
  }
]

interface SettingsContentProps {
  initialEmail?: string;
  initialName?: string;
}

export function SettingsContent({ initialEmail = '', initialName = '' }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState('Settings')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSave = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (!result?.error) {
        router.refresh()
      }
    })
  }

  // Generate initials
  const initials = initialName
    ? initialName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : initialEmail.substring(0, 2).toUpperCase()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 py-10 relative z-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">Settings.</h1>
          <p className="text-zinc-500 dark:text-white/40 mt-2 text-base">Manage your personal and workspace configurations.</p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Nav */}
        <motion.div variants={itemVariants} className="w-full lg:w-64 shrink-0 space-y-6">
          {navSections.map((section, i) => (
            <div key={i}>
              <h4 className="text-zinc-500 dark:text-white/30 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center justify-start h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.label
                        ? 'bg-blue-500 text-zinc-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'text-zinc-500 dark:hover:text-white/50 hover:text- dark:hover:text-$3$3 hover:bg-white dark:bg-white/5 border-zinc-200'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mr-3 shrink-0 ${activeTab === item.label ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-white/40'}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Affiliates Banner (Placeholder) */}
          <div className="mt-8 p-4 rounded-xl bg-white dark:hover:bg-white/4 border-zinc-200 border dark:border-white/8 group cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h5 className="text-sm font-bold text-zinc-900 dark:text-white">Affiliates</h5>
            </div>
            <p className="text-xs text-zinc-500 dark:text-white/40 leading-relaxed mb-3">
              Invite others to Marketme and earn recurring commission from referrals.
            </p>
            <span className="text-xs font-medium text-zinc-900 dark:text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">
              → Manage
            </span>
          </div>
        </motion.div>

        {/* Main Settings Content */}
        <div className="flex-1 space-y-6 min-w-0">
          {activeTab === 'Settings' && (
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Profile</h3>
              
              <form action={handleSave} className="space-y-6">
                {/* Image Upload */}
                <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 backdrop-blur-xl">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">Image</h4>
                  <p className="text-sm text-zinc-500 dark:text-white/40 mb-4">You can upload your own image or keep the default.</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-green-700 text-zinc-900 dark:text-white flex items-center justify-center font-bold text-2xl shadow-[0_0_20px_rgba(21,128,61,0.2)] border border-green-600">
                        {initials || 'ME'}
                      </div>
                      <div>
                        <h5 className="font-semibold text-zinc-900 dark:text-white text-sm">Update profile image</h5>
                        <p className="text-xs text-zinc-500 dark:text-white/40 mt-1">PNG or JPG allowed. Maximum size: 5mb</p>
                      </div>
                    </div>
                    <Button type="button" className="bg-white dark:hover:bg-white/10 border-zinc-200 hover:bg-white dark:hover:bg-white/20 text-zinc-900 dark:text-white font-medium shadow-none border dark:border-white/10 gap-2">
                      <UploadCloud className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 backdrop-blur-xl">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">Basic information</h4>
                  <p className="text-sm text-zinc-500 dark:text-white/40 mb-6">You can change some basic information.</p>
                  
                  <div className="space-y-5 max-w-lg">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-zinc-500 dark:text-white/50 font-medium text-xs">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={initialName}
                        placeholder="Your full name"
                        className="h-11 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white rounded-xl shadow-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-500 dark:text-white/50 font-medium text-xs">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        defaultValue={initialEmail}
                        className="h-11 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-500 dark:text-white/50 rounded-xl shadow-none cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Theme Mode */}
                <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 backdrop-blur-xl">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">Theme mode</h4>
                  <p className="text-sm text-zinc-500 dark:text-white/40 mb-6">Select theme for the dashboard.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div 
                      onClick={() => setTheme('light')}
                      className={`p-1 rounded-xl border-2 cursor-pointer transition-colors relative group ${theme === 'light' ? 'border-blue-500' : 'border-transparent hover:border-zinc-200 dark:border-white/20'}`}
                    >
                      {mounted && theme === 'light' && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0c0c18]">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <div className="aspect-video bg-white rounded-lg flex items-center justify-center text-zinc-950 font-bold border border-zinc-200 shadow-sm">
                        Light
                      </div>
                    </div>
                    <div 
                      onClick={() => setTheme('dark')}
                      className={`p-1 rounded-xl border-2 cursor-pointer transition-colors relative group ${theme === 'dark' ? 'border-blue-500' : 'border-transparent hover:border-zinc-200 dark:border-white/20'}`}
                    >
                      {mounted && theme === 'dark' && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0c0c18]">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <div className="aspect-video bg-[#0c0c18] rounded-lg flex items-center justify-center text-zinc-900 dark:text-white font-bold border border-zinc-200 dark:border-white/10">
                        Dark
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="h-11 px-8 bg-blue-500 hover:bg-blue-400 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] border-0 transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
                  >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'Billing' && (
            <BillingContent />
          )}

          {activeTab === 'Team' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Team Members</h3>
                  <p className="text-zinc-500 dark:text-white/40 text-sm">Manage who has access to this workspace.</p>
                </div>
                <Button className="h-10 px-5 bg-blue-500 hover:bg-blue-400 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] border-0 transition-all">
                  Invite Member
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">Active Members</h4>
                  <span className="text-xs font-medium text-zinc-500 dark:text-white/40">1 / 3 seats used</span>
                </div>
                
                <div className="space-y-4">
                  {/* Current User */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-700 text-zinc-900 dark:text-white flex items-center justify-center font-bold text-sm">
                        {initials || 'ME'}
                      </div>
                      <div>
                        <h5 className="font-semibold text-zinc-900 dark:text-white text-sm">{initialName || 'You'} <span className="text-xs bg-white dark:bg-white/10 border-zinc-200 text-zinc-500 dark:text-white/70 px-2 py-0.5 rounded-full ml-2">You</span></h5>
                        <p className="text-xs text-zinc-500 dark:text-white/40">{initialEmail}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white dark:bg-white/5 border-zinc-200 border dark:border-white/10 rounded-lg text-xs font-medium text-zinc-500 dark:text-white/70">
                      Owner
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Workspace' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Workspace Settings</h3>
                <p className="text-zinc-500 dark:text-white/40 text-sm">Manage your workspace identity and preferences.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 backdrop-blur-xl space-y-6">
                <div className="space-y-2 max-w-md">
                  <Label className="text-zinc-500 dark:text-white/50 font-medium text-xs">Workspace Name</Label>
                  <Input
                    defaultValue="Coca Cola Campaign"
                    className="h-11 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white rounded-xl shadow-none"
                  />
                </div>
                
                <div className="pt-4 flex justify-start">
                  <Button className="h-11 px-8 bg-white dark:hover:bg-white/10 border-zinc-200 hover:bg-white dark:hover:bg-white/20 text-zinc-900 dark:text-white font-medium rounded-xl border dark:border-white/10 transition-all">
                    Save Workspace
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl mt-8">
                <h4 className="text-base font-bold text-red-400 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-400/60 mb-6">Permanently delete this workspace and all of its content. This action cannot be undone.</p>
                <Button variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-zinc-900 dark:hover:text-white border border-red-500/20 font-medium rounded-xl transition-all">
                  Delete Workspace
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'Calendar' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Calendar Preferences</h3>
                <p className="text-zinc-500 dark:text-white/40 text-sm">Customize how your content planner looks and behaves.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 backdrop-blur-xl space-y-8 max-w-2xl">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Default Timezone</h4>
                  <p className="text-xs text-zinc-500 dark:text-white/40 mb-2">All scheduled posts will use this timezone.</p>
                  <select className="w-full h-11 bg-white dark:bg-white/5 border-zinc-200 border dark:border-white/10 rounded-xl text-zinc-900 dark:text-white px-4 outline-hidden focus:border-blue-400/50 appearance-none">
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="CST">Central Standard Time (CST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Start of the week</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 cursor-pointer flex-1">
                      <input type="radio" name="week_start" defaultChecked className="accent-blue-500" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">Sunday</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 cursor-pointer flex-1">
                      <input type="radio" name="week_start" className="accent-blue-500" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">Monday</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button className="h-11 px-8 bg-blue-500 hover:bg-blue-400 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] border-0 transition-all">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'API' && (
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">API Keys</h3>
                  <p className="text-zinc-500 dark:text-white/40 text-sm">Manage API keys for external integrations.</p>
                </div>
                <Button className="h-10 px-5 bg-white text-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/90 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                  Generate New Key
                </Button>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/2 overflow-hidden">
                <div className="grid grid-cols-3 text-xs font-bold text-zinc-500 dark:text-white/40 uppercase tracking-wider px-6 py-4 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-white/5">
                  <div className="col-span-1">Name</div>
                  <div className="col-span-1">Key</div>
                  <div className="col-span-1 text-right">Created</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Code className="w-10 h-10 text-zinc-500 dark:text-white/20 mb-4" />
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-1">No API keys yet</h4>
                  <p className="text-sm text-zinc-500 dark:text-white/40">Generate a key to start authenticating API requests.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
