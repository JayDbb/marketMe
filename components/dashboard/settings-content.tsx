'use client'

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
  {
    title: 'Account',
    items: [
      { label: 'Profile', icon: User },
      { label: 'Preferences', icon: SlidersHorizontal },
    ],
  },
  {
    title: 'Subscription',
    items: [{ label: 'Billing', icon: CreditCard }],
  },
  {
    title: 'Workspace',
    items: [
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
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    parseTab(searchParams.get('tab'))
  )

  useEffect(() => {
    const canonical = parseTab(searchParams.get('tab'))
    setActiveTab(canonical)
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
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const planBadge = PLANS[account.plan].badge

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative z-10 mx-auto max-w-6xl px-6 py-10"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-accent-foreground">
          Account
        </p>
        <h1 className="text-pretty font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {settings.displayName} · {account.planLabel} plan · {settings.email}
        </p>
      </motion.div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <motion.nav
          variants={itemVariants}
          className="flex w-full shrink-0 flex-col gap-6 lg:w-64"
        >
          {navSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => selectTab(item.label)}
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
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.nav>

        <motion.div variants={itemVariants} className="min-w-0 flex-1">
          {activeTab === 'Profile' ? (
            <SettingsProfileTab
              settings={settings}
              onSaved={(name) => {
                setSettings((s) => ({ ...s, displayName: name }))
                setAccountEdits((a) => ({
                  ...a,
                  displayName: name,
                  initials: getInitials(name),
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
            <SettingsWorkspaceTab
              settings={settings}
              onSaved={(business) => setSettings((s) => ({ ...s, business }))}
            />
          ) : null}

          {activeTab === 'Preferences' ? (
            <SettingsPreferencesTab
              settings={settings}
              onSaved={(preferences) =>
                setSettings((s) => ({ ...s, preferences }))
              }
            />
          ) : null}

          {activeTab === 'AI' ? (
            <SettingsAiTab
              settings={settings}
              onSaved={(ai) => setSettings((s) => ({ ...s, ai }))}
            />
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  )
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
