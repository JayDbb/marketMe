-- Admin flag on Better Auth user rows — manage live admins in Supabase
-- Table Editor or SQL, without host env vars (Vercel/etc).

ALTER TABLE public."user"
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_user_is_admin
  ON public."user" (is_admin)
  WHERE is_admin = TRUE;

COMMENT ON COLUMN public."user".is_admin IS
  'When true, this account can open /dashboard/admin. Toggle in Supabase Table Editor.';
