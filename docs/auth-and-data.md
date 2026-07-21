# Auth & data flow

Quick reference for contributors. **Auth and app data use different systems on purpose.**

## Mental model

| Concern | System | Where |
|---------|--------|--------|
| Who is logged in? | **Better Auth** | `lib/auth.ts`, cookies, `getAuthenticatedUser()` |
| Posts, profiles, templates, storage | **Supabase (Postgres + Storage)** | `lib/supabase/admin.ts`, server actions |

Supabase Auth is **not** used for login. The `user.id` from Better Auth is stored on Supabase rows as `user_id`.

## Auth clients (two files — do not merge)

### `lib/auth-client.ts` — dashboard auth UI

- Use in login/signup components (`signIn`, `signUp`, `signOut`).
- Includes `@better-auth/infra` dash plugin for analytics.
- `"use client"` + `better-auth/client`.

### `lib/auth-session.ts` — marketing navbar only

- Lightweight client: `sessionClient.getSession()` to show Log in vs Dashboard.
- No infra plugin; avoids pulling dashboard auth into marketing bundle.
- Do **not** use `better-auth/react` `useSession()` — it breaks under Turbopack in this project.

## Server-side auth check

```typescript
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

const user = await getAuthenticatedUser()
if (!user) redirect('/login')
// user.id → filter Supabase queries
```

## Route protection

`proxy.ts` runs on:

- `/dashboard/*`
- `/onboarding`
- `/api/auth/*`

Unauthenticated dashboard requests redirect to `/login`.

## Magic link

1. User submits email on login → `signInWithMagicLink` server action.
2. Better Auth `magicLink` plugin sends email via Resend (`RESEND_API_KEY`).
3. User clicks link → Better Auth verifies → session cookie → redirect to `/dashboard` or `/onboarding`.

## Supabase access

```typescript
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const supabase = getSupabaseAdmin()
await supabase.from('posts').select('*').eq('user_id', user.id)
```

`getSupabaseAdmin()` lazy-initializes and throws a clear error if env vars are missing.

**Never** import `getSupabaseAdmin` or `SUPABASE_SERVICE_ROLE_KEY` in client components.

## Required env (dashboard + auth)

See `.env.example`. Minimum:

- `DATABASE_URL` — Better Auth + Postgres
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Marketing pages work without these; auth and dashboard do not.

## Adding a new dashboard feature

1. Page in `app/dashboard/<feature>/page.tsx` — call `getAuthenticatedUser()`, redirect if null.
2. Server actions in `actions.ts` beside the page (or colocated module).
3. UI in `components/dashboard/<feature>/`.
4. Reuse `getSupabaseAdmin()` + `user.id` for persistence.
