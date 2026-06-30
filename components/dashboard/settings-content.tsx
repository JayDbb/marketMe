"use client";

import { BillingContent } from "@/components/dashboard/billing-content";
import { SettingsCalendarTab } from "@/components/dashboard/settings/settings-calendar-tab";
import { SettingsProfileTab } from "@/components/dashboard/settings/settings-profile-tab";
import { SettingsTeamTab } from "@/components/dashboard/settings/settings-team-tab";
import { SettingsWorkspaceTab } from "@/components/dashboard/settings/settings-workspace-tab";
import { getInitials, PLANS } from "@/lib/billing-utils";
import type { AccountContext } from "@/types/billing";
import type { SettingsData } from "@/types/settings";
import { motion, Variants } from "framer-motion";
import {
  Calendar,
  Code,
  CreditCard,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, Suspense, useEffect, useState } from "react";

const TABS = [
  "Settings",
  "Team",
  "Billing",
  "Workspace",
  "Calendar",
  "API",
] as const;

type TabId = (typeof TABS)[number];

const navSections = [
  {
    title: "Account",
    items: [
      { label: "Settings" as TabId, icon: Settings },
      { label: "Team" as TabId, icon: Users },
    ],
  },
  {
    title: "Subscription",
    items: [{ label: "Billing" as TabId, icon: CreditCard }],
  },
  {
    title: "Workspace",
    items: [
      { label: "Workspace" as TabId, icon: LayoutDashboard },
      { label: "Calendar" as TabId, icon: Calendar },
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
  account: AccountContext;
  settings: SettingsData;
}

function SettingsContentInner({
  account: initialAccount,
  settings: initialSettings,
}: SettingsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [account, setAccount] = useState(initialAccount);
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const t = searchParams.get("tab");
    return t && TABS.includes(t as TabId) ? (t as TabId) : "Settings";
  });

  useEffect(() => {
    if (
      tabParam &&
      TABS.includes(tabParam as TabId) &&
      tabParam !== activeTab
    ) {
      startTransition(() => {
        setActiveTab(tabParam as TabId);
      });
    }
  }, [tabParam, activeTab]);

  const selectTab = (tab: TabId) => {
    setActiveTab(tab);
    router.replace(`/dashboard/settings?tab=${tab}`, { scroll: false });
  };

  const planBadge = PLANS[account.plan].badge;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 py-10 relative z-10"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400/80 mb-1">
          Account
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-white/40 mt-2 text-sm">
          {settings.displayName} · {account.planLabel} plan · {settings.email}
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-10">
        <motion.nav
          variants={itemVariants}
          className="w-full lg:w-64 shrink-0 space-y-6"
        >
          {navSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-zinc-400 dark:text-white/30 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => selectTab(item.label)}
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
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.nav>

        <motion.div variants={itemVariants} className="flex-1 min-w-0">
          {activeTab === "Settings" && (
            <SettingsProfileTab
              settings={settings}
              onSaved={(name) => {
                setSettings((s) => ({ ...s, displayName: name }));
                setAccount((a) => ({
                  ...a,
                  displayName: name,
                  initials: getInitials(name),
                }));
              }}
              onAvatarUpdated={(avatarUrl) => {
                setSettings((s) => ({ ...s, avatarUrl }));
                setAccount((a) => ({ ...a, avatarUrl }));
              }}
            />
          )}

          {activeTab === "Billing" && <BillingContent account={account} />}

          {activeTab === "Team" && (
            <SettingsTeamTab settings={settings} account={account} />
          )}

          {activeTab === "Workspace" && (
            <SettingsWorkspaceTab
              settings={settings}
              onSaved={(business) => setSettings((s) => ({ ...s, business }))}
            />
          )}

          {activeTab === "Calendar" && (
            <SettingsCalendarTab
              settings={settings}
              onSaved={(preferences) =>
                setSettings((s) => ({ ...s, preferences }))
              }
            />
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
