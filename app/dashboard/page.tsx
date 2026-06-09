import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { submitFeedback } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, Settings, User, MessageSquare, Send } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-zinc-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white">Welcome back.</h1>
          <p className="text-zinc-400 mt-3 text-lg">Here's a snapshot of your workspace performance today.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 hover:bg-zinc-900/60 transition-colors shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Leads</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                <User className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white tracking-tight">1,234</div>
              <p className="text-xs text-emerald-400 bg-emerald-500/10 inline-flex px-2 py-1 rounded-md mt-3 font-medium border border-emerald-500/20">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 hover:bg-zinc-900/60 transition-colors shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Campaigns</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white tracking-tight">12</div>
              <p className="text-xs text-emerald-400 bg-emerald-500/10 inline-flex px-2 py-1 rounded-md mt-3 font-medium border border-emerald-500/20">
                +3 new this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 hover:bg-zinc-900/60 transition-colors shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400">Automation Health</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                <Settings className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-emerald-400 tracking-tight">99.9%</div>
              <p className="text-xs text-zinc-500 mt-3 font-medium">
                All systems running normally
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <div className="mt-16">
          <Card className="bg-zinc-900/60 backdrop-blur-2xl border-zinc-800/60 text-zinc-50 max-w-2xl shadow-2xl rounded-2xl overflow-hidden">
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
              <form action={submitFeedback} className="space-y-6">
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
        </div>
      </div>
    </div>
  )
}
