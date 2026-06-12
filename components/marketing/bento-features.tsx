import { Zap, Bot, Shield, LineChart, Cpu, Workflow } from "lucide-react";

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
      {/* Section header — matches reference "Everything you need" */}
      <div className="text-center max-w-xl mx-auto mb-14">
        <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tighter text-white mb-4 leading-tight">
          Everything you need
        </h2>
        <p className="text-white/45 text-base leading-relaxed">
          Enjoy customizable lists, team work tools, and smart tracking all in one place. Set tasks, get reminders, and see your progress simply and quickly.
        </p>
      </div>

      {/* Feature grid — dark cards matching reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <div
            key={i}
            className={`group relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6 hover:bg-white/6 hover:border-white/12 transition-all duration-300 overflow-hidden ${
              i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors duration-300">
              <feature.icon
                className="w-5 h-5 text-blue-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="text-base font-semibold text-white/90 tracking-tight mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed">
              {feature.description}
            </p>

            {/* Subtle corner glow on hover */}
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
