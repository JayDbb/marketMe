export interface LinearUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface LinearState {
  id: string;
  name: string;
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
  color: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  states: LinearState[];
}

export interface LinearIssue {
  id: string;
  title: string;
  identifier: string;
  priority: number; // 0, 1, 2, 3, 4
  description?: string;
  createdAt: string;
  updatedAt: string;
  state: LinearState;
  assignee?: LinearUser;
  team: {
    id: string;
    name: string;
    key: string;
  };
}

export interface LinearActivity {
  id: string;
  issueId: string;
  issueTitle: string;
  action: string;
  timestamp: string;
  user: LinearUser;
}

export const MOCK_USER: LinearUser = {
  id: "usr_alex_mercer",
  name: "Alex Mercer",
  email: "alex@marketme.dev",
};

export const MOCK_MEMBERS: LinearUser[] = [
  MOCK_USER,
  { id: "usr_elena_rostova", name: "Elena Rostova", email: "elena@marketme.dev" },
  { id: "usr_marcus_vance", name: "Marcus Vance", email: "marcus@marketme.dev" },
  { id: "usr_tariq_saeed", name: "Tariq Saeed", email: "tariq@marketme.dev" }
];

export const MOCK_STATES: LinearState[] = [
  { id: "st_backlog", name: "Backlog", type: "backlog", color: "#8a8f98" },
  { id: "st_todo", name: "Todo", type: "unstarted", color: "#f27b2c" },
  { id: "st_in_progress", name: "In Progress", type: "started", color: "#1b8ef2" },
  { id: "st_done", name: "Done", type: "completed", color: "#00b271" },
  { id: "st_canceled", name: "Canceled", type: "canceled", color: "#f14242" }
];

export const MOCK_TEAMS: LinearTeam[] = [
  {
    id: "team_growth",
    name: "Growth & Acquisition",
    key: "GRO",
    states: MOCK_STATES
  },
  {
    id: "team_core",
    name: "Core Platform",
    key: "COR",
    states: MOCK_STATES
  },
  {
    id: "team_infra",
    name: "Infrastructure & Security",
    key: "INF",
    states: MOCK_STATES
  }
];

export const MOCK_ISSUES: LinearIssue[] = [
  {
    id: "iss_gro_1",
    title: "Optimize SEO metadata and OpenGraph templates",
    identifier: "GRO-1",
    priority: 3, // High
    description: "Our metadata tags are missing correct dimensions for social cards. We need dynamic OG rendering for all product routes to boost referral conversion rates.",
    createdAt: "2026-06-01T08:30:00Z",
    updatedAt: "2026-06-08T12:00:00Z",
    state: MOCK_STATES[2], // In Progress
    assignee: MOCK_USER,
    team: { id: "team_growth", name: "Growth & Acquisition", key: "GRO" }
  },
  {
    id: "iss_gro_2",
    title: "Implement multi-variant conversion rate A/B tests",
    identifier: "GRO-2",
    priority: 2, // Medium
    description: "Setup post-onboarding flow variations. Route 50% of users to short form and 50% to long form to measure form dropout rates.",
    createdAt: "2026-06-03T10:15:00Z",
    updatedAt: "2026-06-03T10:15:00Z",
    state: MOCK_STATES[1], // Todo
    assignee: MOCK_MEMBERS[1], // Elena
    team: { id: "team_growth", name: "Growth & Acquisition", key: "GRO" }
  },
  {
    id: "iss_cor_1",
    title: "Resolve memory leaks in concurrent token validation",
    identifier: "COR-1",
    priority: 4, // Urgent
    description: "CPU spikes noticed on auth token verification under heavy load. Verify JWT expiration cleanup timers in the express middleware stream.",
    createdAt: "2026-06-04T15:45:00Z",
    updatedAt: "2026-06-09T09:20:00Z",
    state: MOCK_STATES[2], // In Progress
    assignee: MOCK_MEMBERS[2], // Marcus
    team: { id: "team_core", name: "Core Platform", key: "COR" }
  },
  {
    id: "iss_cor_2",
    title: "Integrate Stripe billing events and dashboard portal",
    identifier: "COR-2",
    priority: 3, // High
    description: "Allows customers to modify their subscription tiers, view payment history, and download PDF invoices directly from user settings page.",
    createdAt: "2026-06-02T09:00:00Z",
    updatedAt: "2026-06-08T18:40:00Z",
    state: MOCK_STATES[3], // Done
    assignee: MOCK_USER,
    team: { id: "team_core", name: "Core Platform", key: "COR" }
  },
  {
    id: "iss_inf_1",
    title: "Upgrade Postgres connection pool configuration",
    identifier: "INF-1",
    priority: 2, // Medium
    description: "Increase pool sizing from 20 to 100 on production server. Implement connection pooling using PgBouncer to throttle idle clients.",
    createdAt: "2026-06-05T11:00:00Z",
    updatedAt: "2026-06-05T11:00:00Z",
    state: MOCK_STATES[0], // Backlog
    assignee: MOCK_MEMBERS[3], // Tariq
    team: { id: "team_infra", name: "Infrastructure & Security", key: "INF" }
  },
  {
    id: "iss_inf_2",
    title: "Verify security patches for node package registry dependencies",
    identifier: "INF-2",
    priority: 1, // Low
    description: "Run audits and resolve devDependency vulnerabilities identified in npm-audit report. Focus primarily on the crypto parser packages.",
    createdAt: "2026-06-06T14:10:00Z",
    updatedAt: "2026-06-07T16:00:00Z",
    state: MOCK_STATES[3], // Done
    assignee: MOCK_MEMBERS[3], // Tariq
    team: { id: "team_infra", name: "Infrastructure & Security", key: "INF" }
  },
  {
    id: "iss_gro_3",
    title: "Add onboarding survey data to CRM webhook sink",
    identifier: "GRO-3",
    priority: 1, // Low
    description: "Format survey inputs as JSON and dispatch webhooks to internal HubSpot endpoints when users complete registration questionnaire.",
    createdAt: "2026-06-07T09:30:00Z",
    updatedAt: "2026-06-07T09:30:00Z",
    state: MOCK_STATES[1], // Todo
    assignee: undefined,
    team: { id: "team_growth", name: "Growth & Acquisition", key: "GRO" }
  }
];

export const MOCK_ACTIVITIES: LinearActivity[] = [
  {
    id: "act_1",
    issueId: "iss_cor_2",
    issueTitle: "Integrate Stripe billing events and dashboard portal",
    action: "completed this issue",
    timestamp: "2026-06-08T18:40:00Z",
    user: MOCK_USER
  },
  {
    id: "act_2",
    issueId: "iss_cor_1",
    issueTitle: "Resolve memory leaks in concurrent token validation",
    action: "assigned to Marcus Vance",
    timestamp: "2026-06-09T09:20:00Z",
    user: MOCK_USER
  },
  {
    id: "act_3",
    issueId: "iss_gro_1",
    issueTitle: "Optimize SEO metadata and OpenGraph templates",
    action: "moved to In Progress",
    timestamp: "2026-06-08T12:00:00Z",
    user: MOCK_USER
  }
];
