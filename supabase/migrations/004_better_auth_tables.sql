-- ============================================================
-- Migration 004: Better Auth Tables
-- Replaces Supabase Auth with Better Auth for session management.
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 1. Better Auth user table
-- Note: We use 'text' for id to match Better Auth's default UUID generation.
CREATE TABLE IF NOT EXISTS public."user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Better Auth session table
CREATE TABLE IF NOT EXISTS public."session" (
  id TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE
);

-- 3. Better Auth account table (for OAuth providers)
CREATE TABLE IF NOT EXISTS public."account" (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Better Auth verification table (for email verification, magic links)
CREATE TABLE IF NOT EXISTS public."verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_user_id ON public."session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_token ON public."session"(token);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON public."account"("userId");
CREATE INDEX IF NOT EXISTS idx_account_provider ON public."account"("providerId", "accountId");
CREATE INDEX IF NOT EXISTS idx_user_email ON public."user"(email);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON public."verification"(identifier);

-- 6. Update business_profiles FK to reference Better Auth user table
--    This requires migrating existing user_ids first if there are existing users.
--    For a fresh setup, this can be applied directly.
--
-- IMPORTANT: If you have existing users in Supabase Auth (auth.users), 
-- you must seed the Better Auth "user" table first with matching UUIDs,
-- then run this migration.
--
-- For now, we ADD the column without the FK constraint to avoid breaking changes.
-- The FK can be added after user data is seeded:
--   ALTER TABLE public.business_profiles 
--     ADD CONSTRAINT business_profiles_user_id_fkey_better_auth
--     FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;
--
-- The application code uses supabaseAdmin for data queries (bypasses RLS),
-- so the FK reference change does NOT impact application functionality.

-- 7. Enable RLS on Better Auth tables (optional but recommended)
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification" ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so Better Auth (using DATABASE_URL directly) can still
-- manage these tables. The policies below prevent accidental exposure via PostgREST.
CREATE POLICY "service_role_only_user" ON public."user"
  USING (FALSE);

CREATE POLICY "service_role_only_session" ON public."session"
  USING (FALSE);

CREATE POLICY "service_role_only_account" ON public."account"
  USING (FALSE);

CREATE POLICY "service_role_only_verification" ON public."verification"
  USING (FALSE);
