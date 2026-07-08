# System Architecture

Marketme is a **Next.js 16 monolith** (App Router) with optional external services. Most business logic runs in this repo; AI generation can call a separate FastAPI service when configured.

## High-level flow

```
User
  ↓
Next.js (marketing + dashboard + API routes)
  ↓
├── Better Auth (sessions, OAuth, magic link) → PostgreSQL (DATABASE_URL)
├── Supabase (app data, storage, RPCs)        → PostgreSQL (same or linked project)
├── Resend (magic-link emails)
├── OpenRouter / OpenAI (content generation, optional)
├── Trigger.dev (background jobs, optional)
└── External FastAPI (MARKETME_AI_API_URL, optional)
```

## Repository layout

```
app/
├── page.tsx, features/, pricing/, blog/ …   # Marketing (mostly static)
├── login/, signup/, onboarding/            # Auth flows
├── dashboard/                              # Authenticated app
│   ├── */page.tsx                          # Route shells (server components)
│   ├── */actions.ts                        # Server actions per feature
│   └── layout.tsx                          # Auth gate + shell
├── api/                                    # Route handlers (REST)
│   ├── auth/[...all]/                      # Better Auth handler
│   ├── pexels/                             # Stock media proxy
│   └── …
components/
├── marketing/                              # Public site UI
├── dashboard/                              # App UI (calendar, studio, generate, …)
├── auth/                                   # Login/signup UI
└── ui/                                     # shadcn primitives
lib/
├── auth.ts                                 # Better Auth server config
├── auth-client.ts                          # Client auth (dashboard: sign-in/out)
├── auth-session.ts                         # Client auth (marketing navbar)
├── supabase/                               # DB clients + route protection helper
├── services/                               # External API clients
└── *.ts                                    # Domain utilities
types/                                      # Shared TypeScript types
hooks/                                      # Shared React hooks
supabase/migrations/                        # SQL schema migrations
src/trigger/                                # Trigger.dev background jobs
scripts/                                    # Dev tooling (clean cache, env check)
proxy.ts                                    # Next.js 16 request proxy (auth gates)
```

## Technology stack

| Layer | Technology | Notes |
|-------|------------|--------|
| Frontend | Next.js 16, React 19, Tailwind 4, shadcn/ui | App Router, Server Actions |
| Auth | Better Auth | Sessions in Postgres; not Supabase Auth |
| Database | PostgreSQL via Supabase | Business data, RLS-bypassed server client for app writes |
| Storage | Supabase Storage | Uploads, studio assets, generated images |
| Email | Resend | Magic-link sign-in |
| AI | OpenAI / OpenRouter | In-app generation; optional FastAPI backend |
| Jobs | Trigger.dev | Scheduled content / notifications |
| Hosting | Vercel (typical) | Frontend + API routes |
| CI | GitHub Actions | `typecheck`, `lint`, `build` on push/PR |

## Authentication

- **Server:** `lib/auth.ts` — Better Auth with email/password, Google OAuth, magic link (Resend).
- **API:** `app/api/auth/[...all]/route.ts` — catch-all handler.
- **Route protection:** `proxy.ts` redirects unauthenticated users away from `/dashboard` and `/onboarding`.
- **Session reads:** `lib/supabase/server-auth.ts` → `getAuthenticatedUser()` wraps Better Auth for server code.

See [docs/auth-and-data.md](docs/auth-and-data.md) for client usage and data boundaries.

## Data access patterns

| Pattern | When to use |
|---------|-------------|
| Server Action in `app/dashboard/*/actions.ts` | Mutations from dashboard UI |
| `getSupabaseAdmin()` in `lib/supabase/admin.ts` | Server-only reads/writes (bypasses RLS) |
| `createClient()` in `lib/supabase/server.ts` | Cookie-aware server client (rare; most data uses admin + user id filter) |
| `createClient()` in `lib/supabase/client.ts` | Browser-only Supabase (limited use) |

Always scope queries by `user_id` from `getAuthenticatedUser()`.

## External services (optional)

| Env var | Service |
|---------|---------|
| `MARKETME_AI_API_URL` | FastAPI AI backend (strategy, briefs) |
| `OPENAI_API_KEY` | Direct OpenAI / OpenRouter generation |
| `LINEAR_PERSONAL_ACCESS_TOKEN` | `/linear` internal tool |
| `STRIPE_SECRET_KEY` | Billing |
| `PEXELS_API_KEY` | Stock images in studio |

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`/`master`:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build` (with placeholder env vars)

Locally, run `npm run validate` before opening a PR.

## Next.js 16 conventions

- Use `"use client"` for `next/dynamic` with `{ ssr: false }`.
- Prefer `better-auth/client` over `better-auth/react` for client modules (avoids Turbopack hook issues).
- Do not list the same package in both `transpilePackages` and `serverExternalPackages` (`better-auth` is external on the server).
- Request proxy lives in `proxy.ts` (not `middleware.ts`).
