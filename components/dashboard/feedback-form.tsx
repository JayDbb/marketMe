'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export function FeedbackForm({ submitFeedbackAction }: { submitFeedbackAction: (formData: FormData) => void }) {
  return (
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
  )
}
