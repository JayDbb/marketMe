import { Zap, Bot, Shield, LineChart, Cpu, Workflow, Database, Cloud } from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Integration ecosystem",
    description:
      "Connect everything you use. Native sync with Salesforce, HubSpot, Snowflake, and 200+ tools — bidirectional, always current.",
    icon: Cpu,
  },
  {
    title: "Goal setting and tracking",
    description:
      "Define and track your goals. Break down objectives into achievable tasks to keep your targets in sight every day.",
    icon: LineChart,
  },
  {
    title: "Secure data encryption",
    description:
      "End-to-end encryption keeps your data secure and protected from unauthorized access. SOC2 Type II certified.",
    icon: Shield,
  },
  {
    title: "Autonomous Lead Routing",
    description:
      "Our AI evaluates incoming leads instantly, scoring them based on firmographics and engagement, then assigns them to the right rep.",
    icon: Bot,
  },
  {
    title: "Workflow Engine",
    description:
      "Visual builder for complex, multi-branch campaigns that trigger off real-time user behavior across email, SMS, and in-app channels.",
    icon: Workflow,
  },
  {
    title: "Instant Processing",
    description:
      "Built on edge functions. Your campaigns deploy globally in under 50ms, ensuring you hit customers exactly when they are active.",
    icon: Zap,
  },
];

export function BentoFeatures() {
  return (
    <section id="features" className="relative w-full max-w-5xl mx-auto px-6 py-24 z-10">
      {/* Section header */}
      <div className="text-center max-w-xl mx-auto mb-14">
        <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tighter text-white mb-4 leading-tight">
          Everything <span className="font-serif italic font-medium text-blue-400">you need</span>
        </h2>
        <p className="text-white/45 text-base leading-relaxed">
          Enjoy customizable lists, team work tools, and smart tracking all in one place. Set tasks, get reminders, and see your progress simply and quickly.
        </p>
      </div>

      {/* Feature grid — Asymmetric Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, i) => {
          const isFullWidth = i === 0 || i === 3;
          
          return (
            <Card
              key={i}
              className={`group relative rounded-2xl border-white/8 bg-white/4 backdrop-blur-sm ring-0 hover:bg-white/6 hover:border-white/12 transition-all duration-300 overflow-hidden ${
                isFullWidth ? "md:col-span-3" : "md:col-span-1"
              }`}
            >
              <CardContent className={`p-6 flex h-full ${isFullWidth ? "flex-col md:flex-row items-center gap-8 min-h-[240px]" : "flex-col"}`}>
                
                {/* Text Content */}
                <div className={`${isFullWidth ? "md:w-1/2 z-10" : "z-10"}`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors duration-300">
                    <feature.icon className="w-5 h-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base font-semibold text-white/90 tracking-tight mb-2 font-sans">
                    {feature.title}
                  </CardTitle>
                  <p className={`text-sm text-white/40 leading-relaxed ${isFullWidth ? "max-w-md" : ""}`}>
                    {feature.description}
                  </p>
                </div>

                {/* Abstract Visuals for Full-Width Cards */}
                {isFullWidth && (
                  <div className="w-full md:w-1/2 h-full min-h-[200px] bg-[#0d1117]/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-white/10 transition-colors">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[20px_20px]" />
                    
                    {i === 0 && (
                      <div className="flex items-center gap-2 md:gap-4 relative z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1c2128] rounded-xl flex items-center justify-center border border-white/10 shadow-xl"><Database className="w-5 h-5 text-blue-400" /></div>
                        <div className="h-px w-4 md:w-8 bg-blue-400/50" />
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]"><Cpu className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /></div>
                        <div className="h-px w-4 md:w-8 bg-blue-400/50" />
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1c2128] rounded-xl flex items-center justify-center border border-white/10 shadow-xl"><Cloud className="w-5 h-5 text-white/50" /></div>
                      </div>
                    )}

                    {i === 3 && (
                      <div className="flex flex-col gap-2 md:gap-3 items-center relative z-10">
                        <div className="w-32 h-8 bg-white/5 rounded-full flex items-center justify-center text-xs text-white/50 border border-white/10 backdrop-blur-sm shadow-xl">Incoming Lead</div>
                        <div className="w-px h-4 md:h-6 bg-blue-400/50" />
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]"><Bot className="w-4 h-4 md:w-5 md:h-5 text-blue-400"/></div>
                        <div className="w-px h-4 md:h-6 bg-blue-400/50" />
                        <div className="flex gap-4 md:gap-8">
                          <div className="w-20 md:w-24 h-8 bg-white/5 rounded-lg flex items-center justify-center text-[10px] md:text-xs text-white/40 border border-white/10 backdrop-blur-sm">Rep A</div>
                          <div className="w-20 md:w-24 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-[10px] md:text-xs text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(96,165,250,0.2)] backdrop-blur-sm">Rep B</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Subtle corner glow on hover */}
                <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
