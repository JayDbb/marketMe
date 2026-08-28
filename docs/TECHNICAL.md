# MarketMe Technical Documentation

Technical reference for developers, operators, and contributors working on the MarketMe codebase.

For setup instructions see [README.md](../README.md). For architecture overview see [ARCHITECTURE.md](../ARCHITECTURE.md). For auth/data boundaries see [auth-and-data.md](./auth-and-data.md).

---

## Table of contents

1. [System overview](#system-overview)
2. [Technology stack](#technology-stack)
3. [Repository structure](#repository-structure)
4. [Authentication and authorization](#authentication-and-authorization)
5. [Data layer](#data-layer)
6. [Application routes](#application-routes)
7. [Server actions](#server-actions)
8. [API routes](#api-routes)
9. [Domain services](#domain-services)
10. [Background jobs (Trigger.dev)](#background-jobs-triggerdev)
11. [External integrations](#external-integrations)
12. [Post lifecycle](#post-lifecycle)
13. [Environment variables](#environment-variables)
14. [Deployment](#deployment)
15. [Database schema](#database-schema)
16. [CI/CD and quality gates](#cicd-and-quality-gates)
17. [Related documentation](#related-documentation)

---

## System overview

MarketMe is a **Next.js 16 monolith** (App Router) deployed on Vercel. It serves:

- A marketing website (static/SSR pages)
- An authenticated dashboard (client + server actions)
- REST API route handlers
- Background jobs via Trigger.dev

```
┌─────────────┐     ┌──────────────────────────────────────────┐
│   Browser   │────▶│  Next.js (Vercel)                        │
└─────────────┘     │  ├── Marketing pages                     │
                    │  ├── Dashboard (Server Actions)          │
                    │  └── API routes                          │
                    └──────┬───────────┬───────────┬───────────┘
                           │           │           │
              ┌────────────▼──┐  ┌─────▼─────┐  ┌──▼──────────────┐
              │ Better Auth   │  │ Supabase  │  │ Trigger.dev     │
              │ (sessions)    │  │ Postgres  │  │ (cron + tasks)  │
              └───────────────┘  │ + Storage │  └────────┬────────┘
                                 └───────────┘           │
              ┌──────────────┐  ┌──────────────┐  ┌─────▼──────────┐
              │ Resend       │  │ OpenAI       │  │ MarketMe AI    │
              │ (email)      │  │ (generation) │  │ (Meta OAuth,   │
              └──────────────┘  └──────────────┘  │  publish)      │
                                                  └────────────────┘
```

### Critical architectural split

| Concern | System |
|---------|--------|
| Sessions, login, OAuth | **Better Auth** → PostgreSQL via `DATABASE_URL` |
| Business data, posts, storage | **Supabase** → same Postgres project |
| User identity | Better Auth `user.id` (text) stored as `user_id` on app rows |
| Instagram OAuth tokens | **MarketMe AI** FastAPI service (not in this repo) |

Better Auth handles authentication. Supabase provides Postgres, Storage, and RLS — but **not** Supabase Auth.

---

## Technology stack

| Layer | Technology | Version / notes |
|-------|------------|-----------------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (Radix + Base UI) | — |
| Animation | Framer Motion | — |
| Auth | Better Auth | Email/password, Google OAuth, magic link |
| Database | PostgreSQL via Supabase | SQL migrations in `supabase/migrations/` |
| Storage | Supabase Storage | `generated-content` bucket |
| Background jobs | Trigger.dev | v4 (`@trigger.dev/sdk`) |
| AI | OpenAI / OpenRouter | Captions, DALL·E images |
| External AI/publish | MarketMe AI API | FastAPI on Render (typical) |
| Email | Resend | Magic links, contact form |
| Billing | Stripe | Plan limits enforced in code |
| Stock media | Pexels API | Studio search |
| Canvas | Konva + react-konva | Studio editor |
| Hosting | Vercel | Frontend + API + daily cron |
| CI | GitHub Actions | typecheck, lint, build |

**Not used:** Prisma. Schema is managed via raw SQL migrations.

---

## Repository structure

```
marketme/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Marketing home
│   ├── features/, pricing/, blog/, help/, …
│   ├── login/, signup/, onboarding/
│   ├── dashboard/              # Authenticated app
│   │   ├── layout.tsx          # Auth gate + shell
│   │   ├── */page.tsx          # Route pages
│   │   └── */actions.ts        # Server actions per feature
│   └── api/                    # REST route handlers
├── components/
│   ├── marketing/              # Public site
│   ├── dashboard/              # App UI by feature
│   ├── auth/                   # Login/signup
│   └── ui/                     # shadcn primitives
├── lib/
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Dashboard client auth
│   ├── auth-session.ts         # Marketing navbar session
│   ├── supabase/               # admin, server, client, middleware
│   ├── services/               # Domain logic (~20 services)
│   └── billing-utils.ts        # Plan definitions
├── types/                      # Shared TypeScript types
├── hooks/                      # Shared React hooks
├── src/trigger/                # Trigger.dev task definitions
├── supabase/migrations/        # SQL schema (39+ migrations)
├── scripts/                    # dev, env check, migrations
├── docs/                       # Documentation
├── proxy.ts                    # Next.js 16 request proxy (auth gates)
├── trigger.config.ts           # Trigger.dev project config
└── vercel.json                 # Vercel cron config
```

---

## Authentication and authorization

### Server configuration

- **Config:** `lib/auth.ts`
- **Handler:** `app/api/auth/[...all]/route.ts`
- **Session reads:** `lib/supabase/server-auth.ts` → `getAuthenticatedUser()`

### Providers

- Email/password
- Google OAuth
- Magic link (via Resend)

### Route protection

`proxy.ts` (Next.js 16 request proxy, replaces middleware) gates:

- `/dashboard/*` — requires session
- `/onboarding` — requires session
- `/api/auth/*` — Better Auth handler

Unauthenticated users are redirected to `/login`.

### Post-auth redirect

`lib/post-auth-redirect.ts`:

- Has business profile → `/dashboard`
- No profile → `/onboarding`

### Admin access

Admin users have `is_admin = true` on `public."user"`. Admin routes:

- `/dashboard/admin` — Admin Console
- `/admin` — redirect shim

See [admin-dashboard.md](./admin-dashboard.md).

### Vercel OAuth notes

- Never set `BETTER_AUTH_URL=http://localhost:3000` on Vercel.
- Register `https://<deploy-host>/api/auth/callback/google` in Google Cloud Console for each host.

---

## Data layer

### Access patterns

| Pattern | Location | When to use |
|---------|----------|-------------|
| Server Action | `app/dashboard/*/actions.ts` | Dashboard mutations |
| Admin client | `getSupabaseAdmin()` in `lib/supabase/admin.ts` | Server reads/writes (bypasses RLS) |
| Server client | `createClient()` in `lib/supabase/server.ts` | Cookie-aware (rare) |
| Browser client | `createClient()` in `lib/supabase/client.ts` | Client-side Supabase (limited) |

**Always scope queries by `user_id` from `getAuthenticatedUser()`.**

### Migrations

Apply via:

```bash
npm run migrate supabase/migrations/<file>.sql
```

Schema evolves through numbered SQL files in `supabase/migrations/`. Do not use Prisma.

---

## Application routes

### Marketing (public)

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/features` | Product capabilities |
| `/pricing` | Plan comparison |
| `/about`, `/customers`, `/contact` | Company pages |
| `/blog`, `/blog/[slug]` | Blog |
| `/changelog` | Product changelog + RSS |
| `/help`, `/help/[slug]` | Help center |
| `/privacy`, `/terms`, `/cookies`, `/dpa`, … | Legal/compliance |

Marketing pages work without backend env vars.

### Auth

| Route | Description |
|-------|-------------|
| `/login` | Magic link, password, Google |
| `/signup` | Registration |
| `/onboarding` | Business profile wizard |
| `/auth/callback`, `/auth/confirm`, `/auth/complete` | Auth callbacks |

### Dashboard (authenticated)

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview |
| `/dashboard/posts` | Post list |
| `/dashboard/calendar` | Planner (day/week/month) |
| `/dashboard/inbox` | Instagram DMs |
| `/dashboard/studio` | Canvas editor |
| `/dashboard/workflows` | Automation |
| `/dashboard/generate` | AI generation |
| `/dashboard/connections` | Social OAuth |
| `/dashboard/settings` | User/workspace settings |
| `/dashboard/admin` | Admin console |
| `/dashboard/ai` | Full AI assistant |

---

## Server actions

Server actions live in `app/dashboard/*/actions.ts` and are called from client components.

| File | Domain |
|------|--------|
| `app/dashboard/actions.ts` | Dashboard-level |
| `app/dashboard/calendar/actions.ts` | Planner CRUD, approve, schedule, reschedule |
| `app/dashboard/posts/actions.ts` | Posts CRUD, publish, retry, bulk delete |
| `app/dashboard/generate/actions.ts` | AI generation context and triggers |
| `app/dashboard/studio/actions.ts` | Templates, canvas save |
| `app/dashboard/settings/actions.ts` | Profile, preferences, billing |
| `app/dashboard/account/actions.ts` | Account management |
| `app/dashboard/workflows/actions.ts` | Workflow CRUD and manual runs |
| `app/dashboard/admin/actions.ts` | Admin mutations |
| `app/onboarding/actions.ts` | Profile completion |
| `app/login/actions.ts` | Login, signup, magic link |

### Calendar create flow (reference)

```
CreatePostModal.handleSubmit()
  → calendar/page.tsx handleCreatePost()
    → createCalendarPostAction()     // inserts draft with scheduled_at
    → scheduleCalendarPostAction()   // approve + transition to scheduled
    → void loadPosts()               // background refresh (non-blocking)
  → modal closes, toast shown
```

---

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...all]` | * | Better Auth handler |
| `/api/business-profile` | GET/PUT | Business profile CRUD |
| `/api/content-plans` | GET/POST | Content plan management |
| `/api/content-plans/generate` | POST | Trigger AI content generation |
| `/api/posts/[id]/status` | PATCH | Post status transitions |
| `/api/posts/[id]/regenerate-caption` | POST | Caption regeneration |
| `/api/posts/[id]/generate-image` | POST | Image generation trigger |
| `/api/social/connect` | POST | Initiate Instagram OAuth |
| `/api/social/connections` | GET/POST | Connection mirror |
| `/api/social/insights` | GET | Instagram insights |
| `/api/inbox/conversations` | GET | Inbox threads |
| `/api/inbox/messages` | GET/POST | Inbox messages |
| `/api/pexels` | GET | Stock image proxy |
| `/api/cron/publish-scheduled` | GET | Vercel cron publish (daily) |
| `/api/analytics/collect` | POST | First-party analytics |
| `/api/contact` | POST | Contact form |
| `/api/health` | GET | Health check |

Cron route is protected by `CRON_SECRET`.

---

## Domain services

Business logic lives in `lib/services/`. Key services:

| Service | Responsibility |
|---------|----------------|
| `creative-pipeline.service.ts` | AI pipeline: strategy → schedule → posts → briefs |
| `marketing-ai.service.ts` | MarketMe AI API client |
| `content.service.ts` | Post CRUD |
| `post-lifecycle.service.ts` | Status transitions, approve, schedule, publish |
| `scheduled-publishing.service.ts` | Cron publish logic, retry handling |
| `social-connections.service.ts` | Connection mirror and sync |
| `workflow.service.ts` | Workflow automation engine |
| `generation.service.ts` | AI generation orchestration |
| `generation-context.service.ts` | Context assembly for AI prompts |
| `brand-memory.service.ts` | Style learning from revise/approve/reject |
| `credits.service.ts` | AI credit ledger and deductions |
| `account.service.ts` | User account and subscription |
| `business.service.ts` | Business profile operations |
| `admin.service.ts` | Admin metrics and mutations |
| `inbox.service.ts` | Instagram inbox sync |
| `instagram-insights.service.ts` | Insights caching |
| `pexels.service.ts` | Stock image search |
| `moderation.service.ts` | Content moderation flags |
| `ai-preferences.service.ts` | User AI model preferences |

---

## Background jobs (Trigger.dev)

Config: `trigger.config.ts` — project `proj_tzdygkuaynmpopiwidtt`.

Tasks defined in `src/trigger/`:

| Task ID | File | Schedule / trigger |
|---------|------|--------------------|
| `business-analysis` | `content-generator.ts` | On demand |
| `marketing-strategy` | `content-generator.ts` | On demand |
| `generate-weekly-content` | `content-generator.ts` | On demand |
| `regenerate-caption` | `content-generator.ts` | On demand |
| `generate-creative-brief` | `content-generator.ts` | On demand |
| `generate-image` | `content-generator.ts` | On demand |
| `image-upload` | `content-generator.ts` | Subtask |
| `instagram-publishing` | `content-generator.ts` | On demand |
| `send-notification` | `content-generator.ts` | Subtask |
| `scheduled-publishing` | `content-generator.ts` | Cron `*/15 * * * *` |
| `workflow-automation-sweep` | `workflow-automation.ts` | Cron `*/15 * * * *` |
| `publish-service-keepalive` | `publish-keepalive.ts` | Cron `*/10 * * * *` |

### Scheduled publishing

Requires `ENABLE_AUTO_PUBLISH=true` (or `INSTAGRAM_PUBLISH_ENABLED`) on both Vercel and Trigger.dev.

Publishes posts where:

- `status = 'scheduled'`
- `approved_at` is set
- `scheduled_at <= now()`

Uses tokens stored on MarketMe AI — user need not be online.

### Deploy Trigger.dev

```bash
npx trigger.dev@latest deploy
```

Env vars are synced from Trigger.dev project settings.

---

## External integrations

### MarketMe AI API

FastAPI service (typically on Render). Env: `MARKETME_AI_API_URL`, `MARKETME_AI_API_KEY`.

Endpoints used by this app:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/strategy/generate` | Marketing strategy |
| `POST /api/v1/schedules/generate` | Weekly schedule |
| `POST /api/v1/posts/generate` | Post captions |
| `POST /api/v1/creative/generate` | Creative briefs |
| `POST /api/v1/publish/instagram` | Publish to Instagram |
| `GET /api/v1/auth/meta/login` | Meta OAuth initiation |
| `GET /api/v1/auth/meta/callback` | Meta OAuth callback |

Client: `lib/services/marketing-ai.service.ts`  
Pipeline: `lib/services/creative-pipeline.service.ts`

### Instagram OAuth flow

```
User clicks Connect
  → POST /api/social/connect (resolves business_profiles.id)
  → Redirect to MarketMe AI /api/v1/auth/meta/login?business_profile_id=…
  → Meta OAuth
  → AI API callback stores tokens
  → Redirect to frontend (rewritten by proxy.ts to /dashboard/connections)
  → POST /api/social/connections (local mirror in business_social_connections)
```

OAuth tokens live on MarketMe AI, not in this Next.js app.

### Stripe

Billing integration via `STRIPE_SECRET_KEY`. Plan limits defined in `lib/billing-utils.ts`:

| Plan | Workspaces | Members | Profiles | Posts/mo | Credits/mo | Price |
|------|------------|---------|----------|----------|------------|-------|
| free | 1 | 1 | 1 | 10 | 50 | $0 |
| pro | 3 | 3 | 5 | 100 | 500 | $29 |
| team | 10 | 10 | 25 | ∞ | 2,000 | $79 |

---

## Post lifecycle

Defined in `lib/services/post-lifecycle.service.ts`.

### Status enum

`draft` | `approved` | `scheduled` | `published` | `failed` | `rejected`

### Allowed transitions

```
draft     → approved, rejected
approved  → scheduled, draft, rejected
scheduled → published, failed, approved
published → (terminal)
failed    → draft, scheduled
rejected  → draft
```

### Key functions

| Function | Behavior |
|----------|----------|
| `transitionPostStatus()` | Validates and applies status change |
| `approveAndSchedulePost()` | Approve draft → queue for publish |
| `retryFailedPost()` | Re-queue failed post or return to draft |
| `publishPostNow()` | Immediate publish via MarketMe AI |

### Insert defaults

`lib/insert-scheduled-post.ts` creates posts as **`draft`** by default with `scheduled_at` set. Scheduling requires explicit transition to `scheduled` via `approveAndSchedulePost()`.

---

## Environment variables

Full reference: [`.env.example`](../.env.example)

### Required (auth + dashboard)

```
DATABASE_URL
BETTER_AUTH_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Auth URLs

```
BETTER_AUTH_URL
NEXT_PUBLIC_SITE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SESSION_EXPIRES_IN
AUTH_SESSION_UPDATE_AGE
```

### Integrations

```
RESEND_API_KEY
RESEND_FROM_EMAIL
CONTACT_FROM_EMAIL
MARKETME_AI_API_URL
MARKETME_AI_API_KEY
MARKETME_AI_BUSINESS_ID
OPENAI_API_KEY
TRIGGER_SECRET_KEY
PEXELS_API_KEY
STRIPE_SECRET_KEY
```

### Publishing

```
ENABLE_AUTO_PUBLISH
INSTAGRAM_PUBLISH_ENABLED
CRON_SECRET
```

### Storage / analytics / admin

```
NEXT_PUBLIC_SUPABASE_BUCKET
ANALYTICS_VISITOR_SALT
ADMIN_EMAILS
```

### Legal / branding

```
NEXT_PUBLIC_LEGAL_ENTITY_NAME
NEXT_PUBLIC_LEGAL_ADDRESS
NEXT_PUBLIC_COMPANY_REGISTRATION
NEXT_PUBLIC_LEGAL_EMAIL
NEXT_PUBLIC_PRIVACY_EMAIL
NEXT_PUBLIC_SUPPORT_EMAIL
```

Verify locally:

```bash
npm run check-env
```

---

## Deployment

### Vercel (frontend + API)

- Branch previews deploy automatically.
- Production typically tracks `main` or `development`.
- Daily cron: `/api/cron/publish-scheduled` (see `vercel.json`).

### Trigger.dev (background jobs)

Deploy separately:

```bash
npx trigger.dev@latest deploy
```

Ensure `ENABLE_AUTO_PUBLISH`, Supabase credentials, and `MARKETME_AI_API_URL` are set in Trigger.dev env.

### Supabase

- Postgres + Storage hosted on Supabase.
- Apply migrations with `npm run migrate`.

### MarketMe AI (external)

- FastAPI service on Render (typical).
- Must set `FRONTEND_URL` to match Vercel deployment host.
- Stores Meta OAuth tokens and handles publish API calls.

### Deployment checklist

- [ ] `BETTER_AUTH_URL` matches deployment host (not localhost on Vercel)
- [ ] Google OAuth redirect URIs registered for each host
- [ ] `ENABLE_AUTO_PUBLISH=true` on Vercel and Trigger.dev
- [ ] Trigger.dev deployed after task changes
- [ ] Supabase migrations applied
- [ ] `MARKETME_AI_API_URL` and key configured on both Vercel and Trigger.dev

---

## Database schema

Schema managed via SQL migrations in `supabase/migrations/`. Key tables:

### Auth (Better Auth)

| Table | Purpose |
|-------|---------|
| `"user"` | User accounts (`is_admin` flag) |
| `"session"` | Active sessions |
| `"account"` | OAuth provider links |
| `"verification"` | Magic link tokens |

### Core app

| Table | Purpose |
|-------|---------|
| `business_profiles` | One per user; industry, tone, brand assets, style memory |
| `content_plans` | Weekly AI content plans |
| `posts` | UUID PK; status, caption, image, schedule, approval metadata |
| `studio_templates` | Saved canvas templates |
| `user_subscriptions` | Plan, Stripe IDs, credits balance |
| `user_preferences` | Timezone, week start |
| `user_ai_preferences` | AI model choices |
| `business_social_connections` | Local Instagram connection mirror |
| `workflows` | Automation definitions |
| `workflow_runs` | Run history |
| `credit_transactions` | Credit ledger |
| `generations` | AI generation audit |
| `moderation_flags` | Content moderation |
| `inbox_messages` | Instagram inbox |
| `instagram_account_insights` | Cached insights |
| `admin_audit_events` | Admin action log |
| `product_events`, `page_events`, `performance_events` | Analytics |

### RLS

RLS is enabled on most tables. Server code typically uses `getSupabaseAdmin()` with explicit `user_id` filtering rather than relying on RLS session context.

---

## CI/CD and quality gates

GitHub Actions (`.github/workflows/ci.yml`) on push/PR:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build` (placeholder env vars)

Local pre-push:

```bash
npm run validate   # typecheck + lint
```

### Next.js 16 conventions

- Use `"use client"` for `next/dynamic` with `{ ssr: false }`.
- Prefer `better-auth/client` over `better-auth/react` for client modules.
- Request proxy lives in `proxy.ts` (not `middleware.ts`).
- Read `node_modules/next/dist/docs/` for API changes — Next.js 16 has breaking changes from earlier versions.

See [AGENTS.md](../AGENTS.md).

---

## Related documentation

| Document | Contents |
|----------|----------|
| [README.md](../README.md) | Setup, scripts, troubleshooting |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | High-level architecture, Instagram OAuth, CI/CD |
| [auth-and-data.md](./auth-and-data.md) | Auth vs Supabase split, client patterns |
| [admin-dashboard.md](./admin-dashboard.md) | Admin console |
| [USER-GUIDE.md](./USER-GUIDE.md) | End-user product guide |
| [.env.example](../.env.example) | Environment variable reference |
| [.agents/rules/workflow.md](../.agents/rules/workflow.md) | Contributor workflow |

---

*Last updated: August 2026*
