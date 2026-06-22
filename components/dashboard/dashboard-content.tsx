import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, Settings, User, MessageSquare, Target, Briefcase, TrendingUp } from 'lucide-react'
import { BusinessProfile } from '@/types/business-profile'
import { GenerateButton } from './generate-button'
import { FeedbackForm } from './feedback-form'
import { FadeIn } from '@/components/ui/fade-in'

interface DashboardContentProps {
  submitFeedbackAction: (formData: FormData) => void;
  profile?: BusinessProfile | null;
}

export function DashboardContent({ submitFeedbackAction, profile }: DashboardContentProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
      <FadeIn className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Welcome back.</h1>
        <p className="text-white/40 mt-2 text-base">Here is your workspace overview for today.</p>
      </FadeIn>

      {/* Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Business Profile Summary (Span 2) */}
        <FadeIn className="lg:col-span-2" delay={0.1}>
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
                  Profile completeness: <span className="text-white/60 font-medium">
                    {profile ? Math.round(Object.values(profile).filter(Boolean).length / Object.keys(profile).length * 100) : 0}%
                  </span> — ready for automated campaigns.
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Generate Content Action */}
        <FadeIn delay={0.2}>
          <Card className="h-full bg-white/4 backdrop-blur-2xl border-white/8 text-white shadow-2xl rounded-2xl overflow-hidden relative flex flex-col items-center justify-center p-7 text-center group">
            <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-2xl pointer-events-none" />

            <GenerateButton profileId={profile?.id} businessName={profile?.business_name || undefined} />
          </Card>
        </FadeIn>
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
        ].map((metric, index) => (
          <FadeIn key={metric.label} delay={0.3 + index * 0.1}>
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
                <p className={`text-xs inline-flex px-2 py-1 rounded-lg mt-3 font-medium border ${metric.badgeNeutral
                    ? 'bg-white/5 text-white/40 border-white/8'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                  {metric.badge}
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Feedback Section */}
      <FadeIn delay={0.6}>
        <Card className="bg-white/4 backdrop-blur-2xl border-white/8 text-white max-w-2xl shadow-2xl rounded-2xl overflow-hidden" id="feedback">
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
            <FeedbackForm submitFeedbackAction={submitFeedbackAction} />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
