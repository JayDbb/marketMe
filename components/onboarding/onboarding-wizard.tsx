'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, ArrowLeft, Building2, Globe, MapPin, AtSign, Users, Target, MessageSquare, Briefcase, Rocket, Sparkles, Megaphone } from 'lucide-react'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 'basics', title: 'The Basics', description: 'Tell us who you are and where you operate.' },
  { id: 'offering', title: 'Offering & Goals', description: 'What do you do and what are you trying to achieve?' },
  { id: 'strategy', title: 'Brand & Strategy', description: 'Help us dial in the AI to match your exact voice.' },
]

const primaryGoals = ['Lead Generation', 'Brand Awareness', 'Direct Sales', 'Bookings / Consultations']
const contentChannels = ['Instagram', 'LinkedIn', 'Twitter / X', 'Email Newsletter', 'TikTok']

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    location: '',
    website: '',
    services: '',
    usp: '',
    primaryGoal: '',
    socialHandle: '',
    tone: '',
    targetCustomers: '',
    competitors: '',
    channels: [] as string[]
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      console.log('Form Submitted to Shell:', formData)
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }))
  }

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  return (
    <div className="flex w-full min-h-[100dvh]">
      {/* Left Sidebar */}
      <div className="hidden lg:flex w-[400px] xl:w-[480px] flex-col justify-between border-r border-zinc-800/50 bg-zinc-900/20 backdrop-blur-3xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Rocket className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Marketme</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Let&apos;s set up your workspace.</h2>
          <p className="text-zinc-400 text-lg mb-12">
            The more context you provide, the better our AI can generate hyper-personalized, high-converting content for your brand.
          </p>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                    index <= currentStep 
                      ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-px h-12 my-2 transition-colors duration-500 ${
                      index < currentStep ? 'bg-emerald-500/50' : 'bg-zinc-800'
                    }`} />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className={`font-semibold transition-colors duration-500 ${index <= currentStep ? 'text-white' : 'text-zinc-500'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm mt-1 transition-colors duration-500 ${index <= currentStep ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentStep ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.4 }}
              className="min-h-[400px]"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
                <p className="text-zinc-400">{steps[currentStep].description}</p>
              </div>

              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      Business Name
                    </Label>
                    <Input 
                      value={formData.businessName}
                      onChange={e => updateFields({ businessName: e.target.value })}
                      placeholder="e.g. Vanguard Atelier"
                      className="h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg px-4"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      Industry
                    </Label>
                    <Input 
                      value={formData.industry}
                      onChange={e => updateFields({ industry: e.target.value })}
                      placeholder="e.g. Luxury Retail"
                      className="h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg px-4"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Location
                      </Label>
                      <Input 
                        value={formData.location}
                        onChange={e => updateFields({ location: e.target.value })}
                        placeholder="e.g. New York, NY"
                        className="h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg px-4"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        Website
                      </Label>
                      <Input 
                        value={formData.website}
                        onChange={e => updateFields({ website: e.target.value })}
                        placeholder="https://"
                        className="h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg px-4"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      Core Services / Products
                    </Label>
                    <Textarea 
                      value={formData.services}
                      onChange={e => updateFields({ services: e.target.value })}
                      placeholder="List your primary services or products. E.g. Bespoke tailoring, personal styling..."
                      className="min-h-[100px] bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-base p-4 resize-y"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Unique Value Proposition (USP)
                    </Label>
                    <Textarea 
                      value={formData.usp}
                      onChange={e => updateFields({ usp: e.target.value })}
                      placeholder="Why do customers choose you over competitors? E.g. We use 100% sustainable materials."
                      className="min-h-[100px] bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-base p-4 resize-y"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Primary Marketing Goal
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {primaryGoals.map(goal => (
                        <button
                          key={goal}
                          onClick={() => updateFields({ primaryGoal: goal })}
                          className={`h-12 px-4 rounded-xl border text-sm font-medium transition-all text-left flex items-center ${
                            formData.primaryGoal === goal 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' 
                              : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-3 transition-colors flex items-center justify-center ${
                            formData.primaryGoal === goal ? 'border-emerald-500' : 'border-zinc-600'
                          }`}>
                            {formData.primaryGoal === goal && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          </div>
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        Target Customers
                      </Label>
                      <Input 
                        value={formData.targetCustomers}
                        onChange={e => updateFields({ targetCustomers: e.target.value })}
                        placeholder="e.g. High-net-worth individuals"
                        className="h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg px-4"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        Brand Tone of Voice
                      </Label>
                      <Input 
                        value={formData.tone}
                        onChange={e => updateFields({ tone: e.target.value })}
                        placeholder="e.g. Authoritative, Elegant"
                        className="h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg px-4"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                        <AtSign className="w-4 h-4 text-emerald-500" />
                        Primary Social Handle
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">@</span>
                        <Input 
                          value={formData.socialHandle}
                          onChange={e => updateFields({ socialHandle: e.target.value })}
                          placeholder="vanguardatelier"
                          className="h-14 pl-8 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg pr-4"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        Key Competitors
                      </Label>
                      <Input 
                        value={formData.competitors}
                        onChange={e => updateFields({ competitors: e.target.value })}
                        placeholder="List 2-3 main competitors."
                        className="h-14 bg-zinc-900/50 border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner text-lg px-4"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-emerald-500" />
                      Content Channels (Select all that apply)
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {contentChannels.map(channel => {
                        const isActive = formData.channels.includes(channel)
                        return (
                          <button
                            key={channel}
                            onClick={() => toggleChannel(channel)}
                            className={`h-10 px-4 rounded-full border text-sm font-medium transition-all ${
                              isActive 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]' 
                                : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            {channel}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between border-t border-zinc-800/50 pt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-zinc-400 hover:text-white disabled:opacity-0 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
