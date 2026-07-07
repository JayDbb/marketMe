# Marketme

AI marketing manager SaaS for small businesses. Built with Next.js 16, TypeScript, and Tailwind CSS.

## Prerequisites

- **Node.js 20+** (see `.nvmrc`)
- npm (comes with Node)

## First-time setup

```bash
git clone <repo-url>
cd marketMe
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

Fill in `.env.local` with your credentials. Ask a teammate for shared dev values, or use your own Supabase / database project.

```bash
npm run check-env   # verify required variables are set
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### What works without a full `.env.local`?

| Area | Works without env? |
|------|--------------------|
| Marketing pages (`/`, `/features`, `/pricing`, `/blog`, …) | Yes |
| Login, signup, dashboard | No — needs `DATABASE_URL`, `BETTER_AUTH_SECRET`, Supabase keys |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (auto-repairs Turbopack cache) |
| `npm run dev:clean` | Clear `.next` cache, then start dev |
| `npm run clean` | Remove `.next` only |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check (run before pushing) |
| `npm run validate` | Typecheck + lint (recommended before push) |
| `npm run check-env` | Warn about missing env variables |

## Troubleshooting

### "Another next build process is already running"

Stop the dev server (`Ctrl+C`) before running `npm run build`.

### Turbopack / `.next` cache errors on Windows

```bash
npm run dev:clean
```

If that fails because a process is locking files, stop all terminals running `npm run dev`, then:

```bash
npm run clean
npm run dev
```

### `ssr: false` with `next/dynamic` in Server Components

`ssr: false` is only allowed inside `"use client"` components. See `components/marketing/home-below-fold.tsx` for the pattern.

### `useSession` / `useRef` runtime errors

Use `better-auth/client` (not `better-auth/react`) for client auth. See `lib/auth-session.ts` and `lib/auth-client.ts`.

### Fresh clone won't build

```bash
npm install
npm run typecheck   # fix any errors before pushing
npm run build
```

## Environment variables

See [`.env.example`](.env.example) for the full list. Minimum for auth + dashboard:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Project structure

```
app/           Routes (marketing, dashboard, API)
components/    UI by domain (marketing, dashboard, auth, ui)
lib/           Auth, Supabase, utilities, services
types/         Shared TypeScript types
hooks/         Shared React hooks
supabase/      SQL migrations
src/trigger/   Trigger.dev background jobs
scripts/       Dev tooling (cache repair, env check)
docs/          Contributor guides
```

Deeper architecture: [ARCHITECTURE.md](ARCHITECTURE.md)  
Auth & data patterns: [docs/auth-and-data.md](docs/auth-and-data.md)

## Collaboration

We work in small, reviewable increments tied to Linear issues.

1. **Start from the issue** — Read the assigned Linear ticket before writing code.
2. **Explore first** — Inspect the existing codebase and follow established patterns.
3. **Plan briefly** — Outline a small implementation plan before making changes.
4. **Smallest viable change** — Ship the minimum that satisfies the issue.
5. **One PR per issue** — Keep pull requests focused and easy to review.
6. **PR checklist** — Run `npm run validate` before opening a PR.

## Best practices

**TypeScript** — Use strict typing. Avoid `any` unless documented.

**Reuse, don't duplicate** — Extend existing utilities and components.

**Secrets** — Never commit `.env.local` or expose service-role keys to the client.

**Next.js** — This project uses Next.js 16 with breaking changes from earlier versions. Check `node_modules/next/dist/docs/` when unsure about APIs.

## Agent & contributor notes

Additional workflow rules for AI agents live in `.agents/rules/workflow.md`.
