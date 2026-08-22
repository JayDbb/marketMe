"use client";

<<<<<<< HEAD
import { BillingContent } from "@/components/dashboard/billing-content";
import { useAccount } from "@/components/dashboard/account-provider";
import { SettingsAiTab } from "@/components/dashboard/settings/settings-ai-tab";
import { SettingsCalendarTab } from "@/components/dashboard/settings/settings-calendar-tab";
import { SettingsProfileTab } from "@/components/dashboard/settings/settings-profile-tab";
import { SettingsTeamTab } from "@/components/dashboard/settings/settings-team-tab";
import { SettingsWorkspaceTab } from "@/components/dashboard/settings/settings-workspace-tab";
import { getInitials, PLANS } from "@/lib/billing-utils";
import type { AccountContext } from "@/types/billing";
import type { SettingsData } from "@/types/settings";
import { motion, type Variants } from "framer-motion";
import {
  Calendar,
  Code,
  CreditCard,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const TABS = [
  "Settings",
  "Team",
  "Billing",
  "Workspace",
  "Calendar",
  "AI",
  "API",
] as const;

type TabId = (typeof TABS)[number];

function parseTab(value: string | null): TabId {
  return value && TABS.includes(value as TabId) ? (value as TabId) : "Settings";
}

function replaceTabInUrl(tab: TabId) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}`
  );
}

const navSections = [
=======
import { BillingContent } from '@/components/dashboard/billing-content'
import { useAccount } from '@/components/dashboard/account-provider'
import { SettingsAiTab } from '@/components/dashboard/settings/settings-ai-tab'
import { SettingsPreferencesTab } from '@/components/dashboard/settings/settings-preferences-tab'
import { SettingsProfileTab } from '@/components/dashboard/settings/settings-profile-tab'
import { SettingsWorkspaceTab } from '@/components/dashboard/settings/settings-workspace-tab'
import {
  SettingsDirtyProvider,
  useSettingsDirty,
} from '@/components/dashboard/settings/settings-dirty'
import { getInitials, PLANS } from '@/lib/billing-utils'
import type { AccountContext } from '@/types/billing'
import type { SettingsData } from '@/types/settings'
import { motion, type Variants } from 'framer-motion'
import {
  CreditCard,
  LayoutDashboard,
  SlidersHorizontal,
  Sparkles,
  User,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const TABS = ['Profile', 'Preferences', 'Billing', 'Workspace', 'AI'] as const

type TabId = (typeof TABS)[number]

const TAB_ALIASES: Record<string, TabId> = {
  Settings: 'Profile',
  Calendar: 'Preferences',
  Planner: 'Preferences',
  Team: 'Profile',
  API: 'Profile',
}

function parseTab(value: string | null): TabId {
  if (value && TABS.includes(value as TabId)) return value as TabId
  if (value && TAB_ALIASES[value]) return TAB_ALIASES[value]
  return 'Profile'
}

const navSections: {
  title: string
  items: { label: TabId; icon: typeof User }[]
}[] = [
>>>>>>> origin/development
  {
    title: "Account",
    items: [
<<<<<<< HEAD
      { label: "Settings" as TabId, icon: Settings },
      { label: "Team" as TabId, icon: Users },
    ],
  },
  {
    title: "Subscription",
    items: [{ label: "Billing" as TabId, icon: CreditCard }],
=======
      { label: 'Profile', icon: User },
      { label: 'Preferences', icon: SlidersHorizontal },
    ],
  },
  {
    title: 'Subscription',
    items: [{ label: 'Billing', icon: CreditCard }],
>>>>>>> origin/development
  },
  {
    title: "Workspace",
    items: [
<<<<<<< HEAD
      { label: "Workspace" as TabId, icon: LayoutDashboard },
      { label: "Calendar" as TabId, icon: Calendar },
      { label: "AI" as TabId, icon: Sparkles },
    ],
  },
  {
    title: "Developers",
    items: [{ label: "API" as TabId, icon: Code }],
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

interface SettingsContentProps {
  settings: SettingsData;
}

function SettingsContentInner({
  settings: initialSettings,
}: SettingsContentProps) {
  const searchParams = useSearchParams();
  const initialAccount = useAccount();

  const [accountEdits, setAccountEdits] = useState<Partial<AccountContext>>({});
  const account: AccountContext = { ...initialAccount, ...accountEdits };
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    parseTab(searchParams.get("tab"))
  );

  // Browser back/forward only — tab clicks stay client-side (no RSC refetch).
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveTab(parseTab(params.get("tab")));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const selectTab = (tab: TabId) => {
    setActiveTab(tab);
    replaceTabInUrl(tab);
  };

  const planBadge = PLANS[account.plan].badge;
=======
      { label: 'Workspace', icon: LayoutDashboard },
      { label: 'AI', icon: Sparkles },
    ],
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 20 },
  },
}

interface SettingsContentProps {
  settings: SettingsData
}

function SettingsContentInner({
  settings: initialSettings,
}: SettingsContentProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { confirmLeave, setDirty } = useSettingsDirty()
  const initialAccount = useAccount()

  const [accountEdits, setAccountEdits] = useState<Partial<AccountContext>>({})
  const account: AccountContext = { ...initialAccount, ...accountEdits }
  const [settings, setSettings] = useState(initialSettings)
  const activeTab = parseTab(searchParams.get('tab'))

  useEffect(() => {
    const canonical = parseTab(searchParams.get('tab'))
    const raw = searchParams.get('tab')
    if (raw && raw !== canonical) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', canonical)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [pathname, router, searchParams])

  const selectTab = (tab: TabId) => {
    if (tab === activeTab) return
    if (!confirmLeave()) return
    setDirty(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const planBadge = PLANS[account.plan].badge
>>>>>>> origin/development

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative z-10 mx-auto max-w-6xl px-6 py-10"
    >
      <motion.div variants={itemVariants} className="mb-10">
<<<<<<< HEAD
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400/80 mb-1">
          Account
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-white/40 mt-2 text-sm">
=======
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-accent-foreground">
          Account
        </p>
        <h1 className="text-pretty font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
>>>>>>> origin/development
          {settings.displayName} · {account.planLabel} plan · {settings.email}
        </p>
      </motion.div>

<<<<<<< HEAD
      <div className="flex flex-col lg:flex-row gap-10">
        <motion.nav
          variants={itemVariants}
          className="w-full lg:w-64 shrink-0 space-y-6"
        >
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-zinc-400 dark:text-white/30 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
=======
      <div className="flex flex-col gap-10 lg:flex-row">
        <motion.nav
          variants={itemVariants}
          className="flex w-full shrink-0 flex-col gap-6 lg:w-64"
        >
          {navSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
>>>>>>> origin/development
                {section.title}
              </h2>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => selectTab(item.label)}
<<<<<<< HEAD
                    className={`w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.label
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3 shrink-0" />
                    {item.label}
                    {item.label === "Billing" && (
                      <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                        {planBadge}
                      </span>
                    )}
=======
                    className={cn(
                      'flex h-10 w-full items-center rounded-lg px-3 text-sm font-medium ui-transition',
                      activeTab === item.label
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="mr-3 size-4 shrink-0" aria-hidden />
                    {item.label}
                    {item.label === 'Billing' ? (
                      <span
                        className={cn(
                          'ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                          activeTab === item.label
                            ? 'bg-primary-foreground/20'
                            : 'bg-muted'
                        )}
                      >
                        {planBadge}
                      </span>
                    ) : null}
>>>>>>> origin/development
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.nav>

<<<<<<< HEAD
        <motion.div variants={itemVariants} className="flex-1 min-w-0">
          {activeTab === "Settings" && (
            <SettingsProfileTab
              settings={settings}
              onSaved={(name) => {
                setSettings((s) => ({ ...s, displayName: name }));
=======
        <motion.div variants={itemVariants} className="min-w-0 flex-1">
          {activeTab === 'Profile' ? (
            <SettingsProfileTab
              settings={settings}
              onSaved={(name) => {
                setSettings((s) => ({ ...s, displayName: name }))
>>>>>>> origin/development
                setAccountEdits((a) => ({
                  ...a,
                  displayName: name,
                  initials: getInitials(name),
<<<<<<< HEAD
                }));
              }}
              onAvatarUpdated={(avatarUrl) => {
                setSettings((s) => ({ ...s, avatarUrl }));
                setAccountEdits((a) => ({ ...a, avatarUrl }));
              }}
            />
          )}

          {activeTab === "Billing" && <BillingContent account={account} />}

          {activeTab === "Team" && (
            <SettingsTeamTab
              settings={settings}
              account={account}
              onGoToBilling={() => selectTab("Billing")}
            />
          )}

          {activeTab === "Workspace" && (
=======
                }))
              }}
              onAvatarUpdated={(avatarUrl) => {
                setSettings((s) => ({ ...s, avatarUrl }))
                setAccountEdits((a) => ({ ...a, avatarUrl }))
              }}
            />
          ) : null}

          {activeTab === 'Billing' ? <BillingContent account={account} /> : null}

          {activeTab === 'Workspace' ? (
>>>>>>> origin/development
            <SettingsWorkspaceTab
              settings={settings}
              onSaved={(business) => setSettings((s) => ({ ...s, business }))}
            />
<<<<<<< HEAD
          )}

          {activeTab === "Calendar" && (
            <SettingsCalendarTab
=======
          ) : null}

          {activeTab === 'Preferences' ? (
            <SettingsPreferencesTab
>>>>>>> origin/development
              settings={settings}
              onSaved={(preferences) =>
                setSettings((s) => ({ ...s, preferences }))
              }
            />
<<<<<<< HEAD
          )}

          {activeTab === "AI" && (
=======
          ) : null}

          {activeTab === 'AI' ? (
>>>>>>> origin/development
            <SettingsAiTab
              settings={settings}
              onSaved={(ai) => setSettings((s) => ({ ...s, ai }))}
            />
<<<<<<< HEAD
          )}

          {activeTab === "API" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  API keys
                </h3>
                <p className="text-sm text-zinc-500 dark:text-white/40">
                  Programmatic access to Marketme is not available yet.
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 p-12 text-center">
                <Code className="w-10 h-10 text-zinc-400 dark:text-white/20 mx-auto mb-4" />
                <p className="text-sm font-medium text-zinc-600 dark:text-white/60">
                  Coming soon
                </p>
                <p className="text-xs text-zinc-500 dark:text-white/35 mt-1 max-w-sm mx-auto">
                  API keys for integrations will be available in a future
                  release.
                </p>
              </div>
            </div>
          )}
=======
          ) : null}
>>>>>>> origin/development
        </motion.div>
      </div>
    </motion.div>
  );
}

export function SettingsContent(props: SettingsContentProps) {
  return (
    <Suspense fallback={null}>
      <SettingsContentInner {...props} />
    </Suspense>
  );
}

export function SettingsContent(props: SettingsContentProps) {
  return (
    <Suspense fallback={null}>
      <SettingsDirtyProvider>
        <SettingsContentInner {...props} />
      </SettingsDirtyProvider>
    </Suspense>
  )
}
