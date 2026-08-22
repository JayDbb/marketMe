"use client"

import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Bot,
  CalendarDays,
  FolderOpen,
  Link2,
  MessageSquare,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AiAction = {
  label: string
  href: string
}

type AiReply = {
  label: string
  title: string
  body: string
  primaryAction: AiAction
  secondaryActions: AiAction[]
}

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
}

interface DashboardAiAssistantProps {
  businessName: string
  defaultGoal: string
  defaultPlatform: string
  variant?: "hero" | "workspace"
  initialPrompt?: string
}

const QUICK_PROMPTS = [
  "Create 3 Instagram posts for this week",
  "Help me plan a product launch",
  "I need a stronger caption for a sale",
  "Show me where to design the post graphic",
]

const DEFAULT_REPLY = (businessName: string, defaultGoal: string, defaultPlatform: string): AiReply => ({
  label: "AI concierge",
  title: `Let's turn ${businessName} into consistent content`,
  body: `Tell me what you want to achieve and I will send you to the right workflow for ${defaultPlatform}. I can help you generate posts, plan a weekly campaign, open the design studio, or get your social accounts connected.`,
  primaryAction: {
    label: `Start generating for ${defaultPlatform}`,
    href: "/dashboard/generate",
  },
  secondaryActions: [
    { label: `Focus on ${defaultGoal}`, href: `/dashboard/generate?prompt=${encodeURIComponent(defaultGoal)}` },
    { label: "Open content calendar", href: "/dashboard/calendar" },
  ],
})

function buildAssistantReply(
  prompt: string,
  businessName: string,
  defaultGoal: string,
  defaultPlatform: string
): AiReply {
  const text = prompt.toLowerCase()

  if (
    text.includes("schedule") ||
    text.includes("calendar") ||
    text.includes("queue") ||
    text.includes("publish")
  ) {
    return {
      label: "Publishing workflow",
      title: "Let's get your content onto the calendar",
      body: `The fastest move is to generate your posts first, then queue them in the planner. If you already have drafts, jump straight into Calendar and assign dates for ${defaultPlatform}.`,
      primaryAction: { label: "Open calendar", href: "/dashboard/calendar" },
      secondaryActions: [
        { label: "Generate posts first", href: `/dashboard/generate?prompt=${encodeURIComponent(prompt)}` },
        { label: "Review existing posts", href: "/dashboard/posts" },
      ],
    }
  }

  if (
    text.includes("design") ||
    text.includes("graphic") ||
    text.includes("visual") ||
    text.includes("template") ||
    text.includes("image")
  ) {
    return {
      label: "Creative workflow",
      title: "Use Studio to shape the visual side",
      body: `I can route you into Studio so you can pick or edit templates, then bring those visuals back into the AI generation flow for ${businessName}.`,
      primaryAction: { label: "Open Studio", href: "/dashboard/studio" },
      secondaryActions: [
        { label: "Generate copy with this idea", href: `/dashboard/generate?prompt=${encodeURIComponent(prompt)}` },
        { label: "Open AI workspace", href: "/dashboard/ai" },
      ],
    }
  }

  if (
    text.includes("connect") ||
    text.includes("instagram") ||
    text.includes("facebook") ||
    text.includes("linkedin") ||
    text.includes("social account")
  ) {
    return {
      label: "Account setup",
      title: "Connect your channels before you publish",
      body: `If you want the AI to produce content you can actually ship, linking your social accounts is the next step. Once connected, you can generate, review, and schedule from one place.`,
      primaryAction: { label: "Open connections", href: "/dashboard/connections" },
      secondaryActions: [
        { label: "Generate content now", href: `/dashboard/generate?prompt=${encodeURIComponent(prompt)}` },
        { label: "View calendar", href: "/dashboard/calendar" },
      ],
    }
  }

  if (
    text.includes("plan") ||
    text.includes("campaign") ||
    text.includes("week") ||
    text.includes("ideas") ||
    text.includes("strategy") ||
    text.includes("post")
  ) {
    return {
      label: "Content generation",
      title: "This belongs in the AI content engine",
      body: `Your request sounds like a generation task, so I would start in the content workflow and prefill your idea. From there you can create several posts, revise captions, and schedule the approved ones.`,
      primaryAction: {
        label: "Open AI generator",
        href: `/dashboard/generate?prompt=${encodeURIComponent(prompt || defaultGoal)}`,
      },
      secondaryActions: [
        { label: "Use the full AI workspace", href: "/dashboard/ai" },
        { label: "Open Studio templates", href: "/dashboard/studio" },
      ],
    }
  }

  return {
    label: "Suggested next step",
    title: "I can guide you into the best workflow",
    body: `For ${businessName}, the most useful starting point is usually content generation. If your goal is still ${defaultGoal}, I can prefill the generator so you land in the right flow immediately.`,
    primaryAction: {
      label: "Start with AI generation",
      href: `/dashboard/generate?prompt=${encodeURIComponent(prompt || defaultGoal)}`,
    },
    secondaryActions: [
      { label: "Open AI workspace", href: "/dashboard/ai" },
      { label: "Browse the calendar", href: "/dashboard/calendar" },
    ],
  }
}

function AssistantReplyCard({ reply }: { reply: AiReply }) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-200 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#0f1117]/85">
      <div className="mb-3 flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300"
        >
          <Bot className="size-3" />
          {reply.label}
        </Badge>
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        {reply.title}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-white/60">
        {reply.body}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={reply.primaryAction.href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-500"
          )}
        >
          {reply.primaryAction.label}
          <ArrowRight className="size-4" />
        </Link>
        {reply.secondaryActions.map((action) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-xl border-zinc-200 bg-white/70 px-4 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
            )}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function DashboardAiAssistant({
  businessName,
  defaultGoal,
  defaultPlatform,
  variant = "hero",
  initialPrompt,
}: DashboardAiAssistantProps) {
  const router = useRouter()
  const normalizedInitialPrompt = variant === "workspace" ? initialPrompt?.trim() ?? "" : ""
  const seededReply = normalizedInitialPrompt
    ? buildAssistantReply(
        normalizedInitialPrompt,
        businessName,
        defaultGoal,
        defaultPlatform
      )
    : DEFAULT_REPLY(businessName, defaultGoal, defaultPlatform)
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: "assistant-intro",
        role: "assistant",
        content: `Tell me what you want MarketMe to do for ${businessName}. I can point you to the fastest path.`,
      },
    ]

    if (!normalizedInitialPrompt) {
      return initialMessages
    }

    return [
      ...initialMessages,
      { id: "initial-user", role: "user", content: normalizedInitialPrompt },
      { id: "initial-assistant", role: "assistant", content: seededReply.body },
    ]
  })
  const [activeReply, setActiveReply] = useState<AiReply>(seededReply)

  const hasPrompt = prompt.trim().length > 0

  const quickActions = useMemo(
    () => [
      {
        label: "Generate posts",
        href: `/dashboard/generate?prompt=${encodeURIComponent(defaultGoal)}`,
        icon: Sparkles,
      },
      {
        label: "Open Studio",
        href: "/dashboard/studio",
        icon: FolderOpen,
      },
      {
        label: "View Calendar",
        href: "/dashboard/calendar",
        icon: CalendarDays,
      },
      {
        label: "Connect channels",
        href: "/dashboard/connections",
        icon: Link2,
      },
    ],
    [defaultGoal]
  )

  const submitPrompt = useCallback(
    (value = prompt) => {
      const trimmed = value.trim()
      if (!trimmed) return

      const reply = buildAssistantReply(trimmed, businessName, defaultGoal, defaultPlatform)

      setMessages((prev) => [
        ...prev,
        { id: `${prev.length}-user`, role: "user", content: trimmed },
        { id: `${prev.length}-assistant`, role: "assistant", content: reply.body },
      ])
      setActiveReply(reply)
      setPrompt("")

      if (variant === "hero") {
        router.push(`/dashboard/ai?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [businessName, defaultGoal, defaultPlatform, prompt, router, variant]
  )

  if (variant === "hero") {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#0f1117]/90 md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_30%)] pointer-events-none" />
        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300"
              >
                <MessageSquare className="size-3" />
                Main feature
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white md:text-4xl">
                Start with AI, then move into the exact workflow you need
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-white/60">
                Ask for posts, campaigns, captions, visuals, or scheduling help. The assistant will route you into the tools MarketMe already gives you.
              </p>
            </div>

            <Link
              href="/dashboard/ai"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl border-zinc-200 bg-white/70 px-4 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              )}
            >
              Open full AI workspace
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 p-2 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Sparkles className="size-5" />
              </div>
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitPrompt()
                  }
                }}
                placeholder="Describe what you want help with..."
                className="h-12 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              />
              <Button
                onClick={() => submitPrompt()}
                disabled={!hasPrompt}
                className="h-12 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-500"
              >
                Start
                <Send className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((quickPrompt) => (
              <button
                key={quickPrompt}
                type="button"
                onClick={() => submitPrompt(quickPrompt)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {quickPrompt}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_380px]">
      <div className="rounded-[2rem] border border-zinc-200 bg-white/90 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#0f1117]/90 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-200 px-2 pb-4 dark:border-white/10">
          <div>
            <Badge
              variant="outline"
              className="border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300"
            >
              <Bot className="size-3" />
              AI workspace
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Ask for what you need
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-white/60">
              This assistant helps you navigate MarketMe&apos;s generation, design, scheduling, and connection tools.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-sm",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-zinc-200 bg-zinc-50/90 p-3 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  type="button"
                  onClick={() => submitPrompt(quickPrompt)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {quickPrompt}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitPrompt()
                  }
                }}
                placeholder={`Ask how to get results on ${defaultPlatform.toLowerCase()}...`}
                className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              />
              <Button
                onClick={() => submitPrompt()}
                disabled={!hasPrompt}
                className="h-12 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-500"
              >
                Send
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AssistantReplyCard reply={activeReply} />

        <div className="rounded-[1.75rem] border border-zinc-200 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#0f1117]/85">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="border-zinc-200 text-zinc-600 dark:border-white/10 dark:text-white/60">
              <Wand2 className="size-3" />
              Quick launch
            </Badge>
          </div>
          <div className="grid gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 transition-colors hover:border-blue-500/30 hover:bg-blue-500/5 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <action.icon className="size-4 text-blue-500" />
                  {action.label}
                </span>
                <ArrowRight className="size-4 text-zinc-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
