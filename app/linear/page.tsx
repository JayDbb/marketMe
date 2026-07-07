"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MOCK_USER,
  MOCK_TEAMS,
  MOCK_ISSUES,
  MOCK_ACTIVITIES,
  MOCK_MEMBERS,
  MOCK_STATES,
  LinearUser,
  LinearTeam,
  LinearIssue,
  LinearState,
  LinearActivity,
} from "./utils/mockData";
import {
  PlusIcon,
  ListIcon,
  KanbanIcon,
  ChartIcon,
  LogOutIcon,
  DatabaseIcon,
  RefreshIcon,
  SparklesIcon,
  ExternalLinkIcon,
  KeyIcon,
} from "./components/Icons";
import BoardView from "./components/BoardView";
import ListView from "./components/ListView";
import AnalyticsView from "./components/AnalyticsView";
import CreateIssueModal from "./components/CreateIssueModal";

type GqlState = { id: string; name: string; type: LinearState["type"]; color?: string };
type GqlMember = LinearUser;
type GqlTeam = {
  id: string;
  name: string;
  key: string;
  states: { nodes: GqlState[] };
  members: { nodes: GqlMember[] };
};
type GqlIssue = Omit<LinearIssue, "state" | "team" | "assignee"> & {
  state: LinearState;
  assignee?: LinearUser;
  team: { id: string; name: string; key: string };
};
type GqlWorkspace = {
  viewer: LinearUser;
  teams: { nodes: GqlTeam[] };
  issues: { nodes: GqlIssue[] };
};

const readDemoMode = () =>
  typeof window !== "undefined" &&
  localStorage.getItem("marketme_linear_demo") === "true";

const readSavedToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("marketme_linear_token")
    : null;

export default function LinearPage() {
  const bootedDemo = readDemoMode();
  const [token, setToken] = useState<string | null>(readSavedToken);
  const [isDemoMode, setIsDemoMode] = useState(bootedDemo);
  const [activeTab, setActiveTab] = useState<"board" | "list" | "analytics" | "activity">("board");
  
  // Data States
  const [viewer, setViewer] = useState<LinearUser | null>(bootedDemo ? MOCK_USER : null);
  const [teams, setTeams] = useState<LinearTeam[]>(bootedDemo ? MOCK_TEAMS : []);
  const [issues, setIssues] = useState<LinearIssue[]>(bootedDemo ? MOCK_ISSUES : []);
  const [activities, setActivities] = useState<LinearActivity[]>(bootedDemo ? MOCK_ACTIVITIES : []);
  const [members, setMembers] = useState<LinearUser[]>(bootedDemo ? MOCK_MEMBERS : []);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [serverHasToken, setServerHasToken] = useState(false);

  const activateDemoMode = useCallback(() => {
    setIsLoading(true);
    setIsDemoMode(true);
    localStorage.setItem("marketme_linear_demo", "true");

    setTimeout(() => {
      setViewer(MOCK_USER);
      setTeams(MOCK_TEAMS);
      setIssues(MOCK_ISSUES);
      setActivities(MOCK_ACTIVITIES);
      setMembers(MOCK_MEMBERS);
      setIsLoading(false);
      setError(null);
    }, 450);
  }, []);

  const fetchLiveData = useCallback(async (authToken: string) => {
    setToken(authToken);
    setIsLoading(true);
    setError(null);

    const query = `
      query GetLinearWorkspace {
        viewer {
          id
          name
          email
          avatarUrl
        }
        teams {
          nodes {
            id
            name
            key
            states {
              nodes {
                id
                name
                type
                color
              }
            }
            members {
              nodes {
                id
                name
                email
                avatarUrl
              }
            }
          }
        }
        issues(first: 50) {
          nodes {
            id
            title
            identifier
            priority
            description
            createdAt
            updatedAt
            state {
              id
              name
              type
              color
            }
            assignee {
              id
              name
              email
              avatarUrl
            }
            team {
              id
              name
              key
            }
          }
        }
      }
    `;

    try {
      const response = await fetch("/api/linear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-linear-token": authToken,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      const { data } = result as { data?: GqlWorkspace };

      if (!data) {
        throw new Error("No data returned from Linear workspace query.");
      }

      setViewer(data.viewer);

      const mappedTeams: LinearTeam[] = data.teams.nodes.map((t) => ({
        id: t.id,
        name: t.name,
        key: t.key,
        states: t.states.nodes.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          color: s.color ?? '#888888',
        })),
      }));
      setTeams(mappedTeams);

      const mappedIssues: LinearIssue[] = data.issues.nodes.map((iss) => ({
        id: iss.id,
        title: iss.title,
        identifier: iss.identifier,
        priority: iss.priority,
        description: iss.description,
        createdAt: iss.createdAt,
        updatedAt: iss.updatedAt,
        state: iss.state,
        assignee: iss.assignee || undefined,
        team: iss.team,
      }));
      setIssues(mappedIssues);

      const allMembersMap = new Map<string, LinearUser>();
      if (data.viewer) {
        allMembersMap.set(data.viewer.id, data.viewer);
      }
      data.teams.nodes.forEach((t) => {
        t.members.nodes.forEach((m) => {
          allMembersMap.set(m.id, m);
        });
      });
      setMembers(Array.from(allMembersMap.values()));

      const initialLogs: LinearActivity[] = mappedIssues
        .slice(0, 5)
        .map((iss, index) => ({
          id: `act_live_${index}`,
          issueId: iss.id,
          issueTitle: iss.title,
          action: "synced from Linear workspace",
          timestamp: iss.updatedAt,
          user: iss.assignee || { id: "system", name: "System", email: "system@linear" },
        }));
      setActivities(initialLogs);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "An error occurred while connecting to Linear API.";
      setError(message);
      localStorage.removeItem("marketme_linear_token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/linear")
      .then((res) => res.json())
      .then((data: { hasToken?: boolean }) => {
        if (cancelled) return;
        setServerHasToken(Boolean(data.hasToken));
        if (data.hasToken && !readSavedToken() && !readDemoMode()) {
          localStorage.setItem("marketme_linear_token", "default");
          window.setTimeout(() => {
            if (!cancelled) void fetchLiveData("default");
          }, 0);
        }
      })
      .catch((err) => console.error("Error checking server token status:", err));

    let savedTimer: number | undefined;
    if (!bootedDemo) {
      const saved = readSavedToken();
      if (saved) {
        savedTimer = window.setTimeout(() => {
          if (!cancelled) void fetchLiveData(saved);
        }, 0);
      }
    }

    return () => {
      cancelled = true;
      if (savedTimer !== undefined) window.clearTimeout(savedTimer);
    };
  }, [bootedDemo, fetchLiveData]);

  const handleDisconnect = () => {
    localStorage.removeItem("marketme_linear_token");
    localStorage.removeItem("marketme_linear_demo");
    setToken(null);
    setIsDemoMode(false);
    setViewer(null);
    setTeams([]);
    setIssues([]);
    setActivities([]);
    setMembers([]);
    setError(null);
  };

  // Connect Token
  const handleConnectToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    
    const formattedToken = inputToken.trim();
    localStorage.setItem("marketme_linear_token", formattedToken);
    localStorage.removeItem("marketme_linear_demo");
    setToken(formattedToken);
    setInputToken("");
    fetchLiveData(formattedToken);
  };

  // Mutate: Create Issue
  const handleCreateIssue = async (issueData: {
    title: string;
    description: string;
    teamId: string;
    stateId: string;
    priority: number;
    assigneeId?: string;
  }) => {
    const activeTeam = teams.find((t) => t.id === issueData.teamId);
    const activeState = activeTeam?.states.find((s) => s.id === issueData.stateId);
    const activeAssignee = members.find((m) => m.id === issueData.assigneeId);

    if (isDemoMode) {
      // Demo mutations in state memory
      const newId = `iss_demo_${Date.now()}`;
      const prefix = activeTeam?.key || "GRO";
      const teamNumber = issues.filter((i) => i.team.id === issueData.teamId).length + 1;
      const newIssue: LinearIssue = {
        id: newId,
        title: issueData.title,
        identifier: `${prefix}-${teamNumber}`,
        priority: issueData.priority,
        description: issueData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        state: activeState || MOCK_STATES[1], // Todo default
        assignee: activeAssignee,
        team: {
          id: issueData.teamId,
          name: activeTeam?.name || "Workspace Team",
          key: prefix,
        },
      };

      setIssues((prev) => [newIssue, ...prev]);

      const newLog: LinearActivity = {
        id: `act_${Date.now()}`,
        issueId: newId,
        issueTitle: issueData.title,
        action: "created this issue",
        timestamp: new Date().toISOString(),
        user: viewer || MOCK_USER,
      };
      setActivities((prev) => [newLog, ...prev]);
      return;
    }

    if (!token) return;

    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            title
            identifier
            priority
            description
            createdAt
            updatedAt
            state {
              id
              name
              type
              color
            }
            assignee {
              id
              name
              email
              avatarUrl
            }
            team {
              id
              name
              key
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        title: issueData.title,
        description: issueData.description,
        teamId: issueData.teamId,
        stateId: issueData.stateId,
        priority: issueData.priority,
        assigneeId: issueData.assigneeId || null,
      },
    };

    const response = await fetch("/api/linear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-linear-token": token,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error);
    if (result.errors && result.errors.length > 0) throw new Error(result.errors[0].message);

    const { issueCreate } = result.data;
    if (!issueCreate.success || !issueCreate.issue) {
      throw new Error("Unable to create issue in Linear workspace.");
    }

    // Insert new issue dynamically into issues state
    const createdIssue: LinearIssue = {
      id: issueCreate.issue.id,
      title: issueCreate.issue.title,
      identifier: issueCreate.issue.identifier,
      priority: issueCreate.issue.priority,
      description: issueCreate.issue.description,
      createdAt: issueCreate.issue.createdAt,
      updatedAt: issueCreate.issue.updatedAt,
      state: issueCreate.issue.state,
      assignee: issueCreate.issue.assignee || undefined,
      team: issueCreate.issue.team,
    };

    setIssues((prev) => [createdIssue, ...prev]);

    const newLog: LinearActivity = {
      id: `act_${Date.now()}`,
      issueId: createdIssue.id,
      issueTitle: createdIssue.title,
      action: "created this issue",
      timestamp: new Date().toISOString(),
      user: viewer || { id: "me", name: "Me", email: "" },
    };
    setActivities((prev) => [newLog, ...prev]);
  };

  // Update State/Status mutation
  const handleUpdateIssueState = async (issueId: string, stateId: string) => {
    const issueToUpdate = issues.find((i) => i.id === issueId);
    if (!issueToUpdate) return;
    
    // Find target state from team
    const teamOfIssue = teams.find((t) => t.id === issueToUpdate.team.id);
    const targetState = teamOfIssue?.states.find((s) => s.id === stateId);
    if (!targetState) return;

    if (isDemoMode) {
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, state: targetState, updatedAt: new Date().toISOString() } : i))
      );

      const newLog: LinearActivity = {
        id: `act_${Date.now()}`,
        issueId,
        issueTitle: issueToUpdate.title,
        action: `moved to ${targetState.name}`,
        timestamp: new Date().toISOString(),
        user: viewer || MOCK_USER,
      };
      setActivities((prev) => [newLog, ...prev]);
      return;
    }

    if (!token) return;

    const mutation = `
      mutation UpdateIssueState($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            state {
              id
              name
              type
              color
            }
          }
        }
      }
    `;

    const variables = {
      id: issueId,
      input: {
        stateId,
      },
    };

    try {
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, state: targetState } : i))
      );

      const response = await fetch("/api/linear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-linear-token": token,
        },
        body: JSON.stringify({ query: mutation, variables }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to update issue status: ${message}`);
      // Refresh to sync local state
      fetchLiveData(token);
    }
  };

  // Update Priority mutation
  const handleUpdateIssuePriority = async (issueId: string, priority: number) => {
    const issueToUpdate = issues.find((i) => i.id === issueId);
    if (!issueToUpdate) return;

    const priorityLabels = ["None", "Low", "Medium", "High", "Urgent"];
    const targetLabel = priorityLabels[priority] || "None";

    if (isDemoMode) {
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, priority, updatedAt: new Date().toISOString() } : i))
      );

      const newLog: LinearActivity = {
        id: `act_${Date.now()}`,
        issueId,
        issueTitle: issueToUpdate.title,
        action: `updated priority to ${targetLabel}`,
        timestamp: new Date().toISOString(),
        user: viewer || MOCK_USER,
      };
      setActivities((prev) => [newLog, ...prev]);
      return;
    }

    if (!token) return;

    const mutation = `
      mutation UpdateIssuePriority($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            priority
          }
        }
      }
    `;

    const variables = {
      id: issueId,
      input: {
        priority,
      },
    };

    try {
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, priority } : i))
      );

      const response = await fetch("/api/linear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-linear-token": token,
        },
        body: JSON.stringify({ query: mutation, variables }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to update issue priority: ${message}`);
      fetchLiveData(token);
    }
  };

  const isConnected = !!token || isDemoMode;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#f9fafb] dark:bg-[#09090b] bg-grid-pattern antialiased">
      {/* 1. CONNECTION SCREEN */}
      {!isConnected ? (
        <main className="flex flex-1 items-center justify-center py-20 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full items-stretch">
            
            {/* Real Connection Card */}
            <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between gap-8 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex flex-col gap-3">
                <span className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 border border-zinc-200/10 shadow-sm">
                  <KeyIcon size={18} />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                  Connect live workspace
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Enter your Linear Personal Access Token to sync issues, modify priority matrix, and track teams in real-time.
                </p>
              </div>

              <form onSubmit={handleConnectToken} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="token-input" className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    Personal Access Token
                  </label>
                  <input
                    id="token-input"
                    type="password"
                    required
                    placeholder="lin_api_..."
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:border-zinc-400 dark:focus:border-zinc-750 focus:outline-none transition-colors text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 rounded-xl">
                    <span className="text-[10px] text-red-500 font-medium leading-relaxed block">
                      {error}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-950 rounded-xl hover:bg-zinc-850 dark:hover:bg-zinc-200 transition-colors shadow-sm active-press"
                >
                  {isLoading ? "Validating Workspace..." : "Connect Linear"}
                </button>

                {serverHasToken && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("marketme_linear_token", "default");
                      setToken("default");
                      fetchLiveData("default");
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-250 bg-zinc-100 dark:bg-zinc-850 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors active-press"
                  >
                    Connect with Server Token
                  </button>
                )}
              </form>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800/40">
                <a
                  href="https://linear.app/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors"
                >
                  Create token in Linear Developer Settings
                  <ExternalLinkIcon size={11} />
                </a>
              </div>
            </div>

            {/* Zero-Config Demo Card */}
            <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between gap-8 border border-dashed border-zinc-200 dark:border-zinc-850">
              <div className="flex flex-col gap-3">
                <span className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200/30 dark:border-zinc-800/50 shadow-inner">
                  <SparklesIcon size={18} />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                  Explore in Demo Mode
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  No account required. Test drive the complete Linear dashboard including the interactive Kanban board, Table view, priority filters, creation forms, and productivity analytics.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-450 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Interactive board status modifications
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-450 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Dynamic search and multi-filtering logic
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-450 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Simulated issue creation & analytics stream
                  </div>
                </div>

                <button
                  type="button"
                  onClick={activateDemoMode}
                  className="w-full mt-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active-press"
                >
                  Launch Demo Mode
                </button>
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800/40 text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                Uses isolated local state. Changes are temporary and do not update any production database.
              </div>
            </div>

          </div>
        </main>
      ) : (
        /* 2. DASHBOARD MAIN SHELL */
        <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 gap-6">
          {/* Header Panel */}
          <header className="glass-panel border border-zinc-200/50 dark:border-zinc-850/70 rounded-[2rem] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Identity */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold font-mono text-sm shadow-sm">
                MM
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Linear Integration
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                    {viewer ? `${viewer.name} (${viewer.email})` : "Syncing..."}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  {isDemoMode ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-650 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md border border-indigo-200/10 uppercase tracking-wide">
                      <DatabaseIcon size={9} />
                      Demo Mode
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-650 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200/10 uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse-subtle" />
                      Live Workspace
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              {!isDemoMode && (
                <button
                  type="button"
                  onClick={() => fetchLiveData(token!)}
                  disabled={isLoading}
                  className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-100/60 hover:bg-zinc-200/40 dark:bg-zinc-850 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50 active-press active:scale-[0.95]"
                  title="Force Sync"
                >
                  <RefreshIcon size={14} className={isLoading ? "animate-spin" : ""} />
                </button>
              )}

              {/* Create Issue */}
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 rounded-xl hover:bg-zinc-850 dark:hover:bg-zinc-200 transition-colors shadow-sm active-press active:scale-[0.97]"
              >
                <PlusIcon size={13} />
                New Issue
              </button>

              {/* Disconnect */}
              <button
                type="button"
                onClick={handleDisconnect}
                className="p-2 text-red-500 hover:text-red-650 bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl border border-red-200/10 transition-colors active-press active:scale-[0.95]"
                title="Disconnect Workspace"
              >
                <LogOutIcon size={14} />
              </button>
            </div>
          </header>

          {/* Sub Navigation Bar */}
          <div className="flex items-center justify-between border-b border-zinc-200/55 dark:border-zinc-850/60 pb-1">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("board")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-all px-1 cursor-pointer ${
                  activeTab === "board"
                    ? "border-zinc-900 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                }`}
              >
                <KanbanIcon size={13} />
                Kanban Board
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-all px-1 cursor-pointer ${
                  activeTab === "list"
                    ? "border-zinc-900 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                }`}
              >
                <ListIcon size={13} />
                Spreadsheet
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-all px-1 cursor-pointer ${
                  activeTab === "analytics"
                    ? "border-zinc-900 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                }`}
              >
                <ChartIcon size={13} />
                Analytics
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("activity")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-all px-1 cursor-pointer ${
                  activeTab === "activity"
                    ? "border-zinc-900 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Activity Feed
              </button>
            </div>
            
            {/* Count indicator */}
            <span className="text-[10px] font-mono text-zinc-450 dark:text-zinc-500 font-semibold uppercase hidden sm:inline-block">
              {issues.length} active workspace issues
            </span>
          </div>

          {/* Error alerts */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 rounded-2xl animate-fade-in flex items-center justify-between gap-3">
              <span className="text-xs text-red-550 dark:text-red-400 font-medium leading-relaxed">
                {error}
              </span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-550 text-xs font-bold font-mono border border-transparent p-0.5 rounded-lg active:scale-[0.95]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 3. DYNAMIC CONTENT PANEL */}
          <div className="flex-1 w-full mt-2">
            {isLoading ? (
              /* High-end loading skeleton indicators */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full animate-pulse-subtle">
                {[1, 2, 3, 4].map((col) => (
                  <div key={col} className="flex flex-col gap-4">
                    <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                    <div className="h-40 w-full bg-zinc-150 dark:bg-zinc-850 rounded-2xl" />
                    <div className="h-44 w-full bg-zinc-150 dark:bg-zinc-850 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Board view tab */}
                {activeTab === "board" && (
                  <BoardView
                    issues={issues}
                    states={MOCK_STATES}
                    onUpdateIssueState={handleUpdateIssueState}
                    onUpdateIssuePriority={handleUpdateIssuePriority}
                  />
                )}

                {/* List view tab */}
                {activeTab === "list" && (
                  <ListView
                    issues={issues}
                    states={MOCK_STATES}
                    onUpdateIssueState={handleUpdateIssueState}
                    onUpdateIssuePriority={handleUpdateIssuePriority}
                    teams={teams}
                  />
                )}

                {/* Analytics view tab */}
                {activeTab === "analytics" && (
                  <AnalyticsView
                    issues={issues}
                    teams={teams}
                    members={members}
                  />
                )}

                {/* Activity feed tab */}
                {activeTab === "activity" && (
                  <div className="flex flex-col gap-4 max-w-xl mx-auto py-4 animate-fade-in">
                    {activities.length === 0 ? (
                      <div className="text-center py-12 text-zinc-450">
                        No activity logged in this workspace
                      </div>
                    ) : (
                      activities.map((act) => (
                        <div
                          key={act.id}
                          className="flex gap-4 items-start p-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
                        >
                          {/* Avatar representation */}
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-650 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-700/50">
                            {act.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          {/* Log details */}
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="text-xs text-zinc-750 dark:text-zinc-300">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {act.user.name}
                              </span>{" "}
                              {act.action}
                            </div>
                            <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-105 italic border-l-2 border-zinc-200 dark:border-zinc-850 pl-2 mt-0.5 leading-relaxed">
                              {act.issueTitle}
                            </div>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono mt-1">
                              {new Date(act.timestamp).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal popup */}
          <CreateIssueModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            teams={teams}
            members={members}
            onSubmit={handleCreateIssue}
          />
        </div>
      )}
    </div>
  );
}
