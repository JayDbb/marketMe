'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function GenerateButton({ profileId, businessName }: { profileId?: string, businessName?: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateStatus, setGenerateStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleGenerate = async () => {
    if (!profileId) return
    
    setIsGenerating(true)
    setGenerateStatus('idle')
    
    try {
      const res = await fetch('/api/content-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: profileId,
          startDate: new Date().toISOString(),
        })
      })
      
      if (!res.ok) throw new Error('Failed to generate')
      
      setGenerateStatus('success')
      setTimeout(() => setGenerateStatus('idle'), 3000)
    } catch {
      setGenerateStatus('error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="w-14 h-14 rounded-2xl bg-blue-500/12 flex items-center justify-center border border-blue-500/20 mb-5 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <Sparkles className="h-7 w-7 text-blue-400" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">Weekly Content</h3>
      <p className="text-xs text-white/40 mb-7 max-w-[180px] leading-relaxed">
        Generate optimized social posts and emails for {businessName || 'your business'}.
      </p>

      <motion.button
        whileTap={{ scale: profileId && !isGenerating ? 0.97 : 1 }}
        onClick={handleGenerate}
        disabled={!profileId || isGenerating}
        className={`w-full py-3 px-5 font-bold rounded-xl shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
          !profileId ? 'bg-white/10 text-white/40 cursor-not-allowed' :
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
    </>
  )
}
