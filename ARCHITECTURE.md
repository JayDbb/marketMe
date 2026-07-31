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

- **Server:** `lib/auth.ts` — Better Auth with email/password, Google OAuth, magic link (Resend). Uses dynamic `baseURL.allowedHosts` (`localhost:*`, `*.vercel.app`, plus env hosts) so OAuth `redirect_uri` matches the current deployment instead of a hardcoded localhost URL.
- **API:** `app/api/auth/[...all]/route.ts` — catch-all handler.
- **Route protection:** `proxy.ts` redirects unauthenticated users away from `/dashboard` and `/onboarding`.
- **Session reads:** `lib/supabase/server-auth.ts` → `getAuthenticatedUser()` wraps Better Auth for server code.
- **Vercel Google OAuth:** Never set `BETTER_AUTH_URL` to localhost on Vercel. Register `https://<deploy-host>/api/auth/callback/google` in Google Cloud Console for each host you use.

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
| `MARKETME_AI_API_URL` | FastAPI creative pipeline (strategy → schedule → posts → creative brief → publish) |
| `MARKETME_AI_API_KEY` | Optional bearer / X-API-Key for the AI API |
| `MARKETME_AI_BUSINESS_ID` | Optional override for integer `business_id` sent to the AI API |
| `OPENAI_API_KEY` | Direct OpenAI / OpenRouter (caption revise, image gen, Generate fallback) |
| `STRIPE_SECRET_KEY` | Billing |
| `PEXELS_API_KEY` | Stock images in studio |

### MarketMe AI creative pipeline

Dashboard Generate and `/api/content-plans/generate` call `lib/services/creative-pipeline.service.ts`, which orchestrates:

1. Business profile → strategy (`POST /api/v1/strategy/generate`)
2. Strategy → weekly schedule (`POST /api/v1/schedules/generate`)
3. Schedule items → posts (`POST /api/v1/posts/generate`)
4. Optional creative briefs (`POST /api/v1/creative/generate`)
5. Image generation stays on OpenAI/OpenRouter (DALL·E) via Trigger
6. Publish via `POST /api/v1/publish/instagram`

### Brand memory (prompt context)

Invisible style learning — no fine-tuning. On revise / approve / reject, MarketMe stores short style notes on `business_profiles` (`style_notes`, `preferred_ctas`, `avoid_phrases`) and loads the last few approved captions into Generate, Revise, and pipeline `additional_instructions`.

### Brand intelligence (brand brain)

Per-business strategy fuel in `brand_intelligence` (migration `028`):

1. **Collect** — onboarding `business_profiles` fields
2. **Enrich** — Instagram connection handle (mirror), optional website text fetch, AI synthesis (`OPENAI_API_KEY`)
3. **Inject** — `buildBrandBrainPromptBlock()` merges brand intelligence + brand memory into Generate / content-plans / Trigger pipeline prompts
4. **Refresh** — after Instagram OAuth confirm (`POST /api/social/connections`), or `POST /api/brand-intelligence`, or Trigger task `refresh-brand-intelligence`

Stores content pillars, voice/visual guidelines, hashtag seeds, CTA patterns, posting windows, and niche trend hooks. Instagram Graph media/insights can later fill `ig_snapshot` when MarketMe AI publish API exposes them.

Barber/salon niches get stronger fallback pillars and posting windows via `lib/niche-presets.ts` (product remains multi-niche).

### Competitor intelligence

Migration `029` adds `business_competitors` + `competitor_insights`:

1. User declares competitors (Instagram handles and/or websites) in onboarding or Settings → Workspace
2. `analyzeCompetitors()` fetches optional website text and synthesizes inferred posting patterns, content types, promo patterns, and opportunities (`OPENAI_API_KEY`)
3. Findings inject into `buildBrandBrainPromptBlock()` alongside brand intelligence (not live IG scrape metrics)
4. Refresh via onboarding/settings save, `POST /api/competitor-intelligence`, or Trigger `analyze-competitors`

### Instagram OAuth (Connections)

Flow:

1. User clicks **Connect** on `/dashboard/connections`
2. Next `POST /api/social/connect` resolves the user’s `business_profiles.id` (UUID)
3. Browser is sent to MarketMe AI `GET /api/v1/auth/meta/login?business_profile_id=…` (signed state → Facebook)
4. Meta redirects to the AI API callback (`/api/v1/auth/meta/callback`)
5. AI API stores Instagram credentials and redirects to the frontend
6. Frontend confirms OAuth success via `POST /api/social/connections` (local mirror in `business_social_connections`) so MarketMe shows the account even if publish list fails
7. `GET /api/social/connections` merges MarketMe AI publish list + local mirror

**Tristan / Render `FRONTEND_URL`** should send users back to:

```text
{FRONTEND_URL}/dashboard/connections?oauth=instagram&status=success
```

On error:

```text
{FRONTEND_URL}/dashboard/connections?oauth=instagram&status=error&error=<message>
```

The Connections page parses those query params, refreshes `/api/social/connections`, and toasts the result.

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
