-- Durable log for admin console mutations (credit grants, plan changes, etc.)
CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id TEXT,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_user_id TEXT,
  target_email TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_audit_events_created_at_idx
  ON public.admin_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS admin_audit_events_target_user_idx
  ON public.admin_audit_events (target_user_id, created_at DESC);

ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;

-- Service role only — no end-user policies (admin console uses service role).
