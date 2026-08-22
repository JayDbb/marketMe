-- Pipeline foundation: credits ledger, generation audit trail, moderation flags,
-- and post approval metadata. No external AI or Instagram dependencies.

-- Extend post_status with rejected (idempotent)
DO $$ BEGIN
  ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'rejected';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Pipeline stage enum for credits and generation logging
DO $$ BEGIN
  CREATE TYPE pipeline_stage AS ENUM (
    'business_profile_intake',
    'marketing_strategy_generation',
    'content_schedule_generation',
    'post_generation',
    'creative_brief_generation',
    'image_generation',
    'publishing'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Credits on subscriptions (per user account; business-level can be added later)
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', NOW()) + interval '1 month');

COMMENT ON COLUMN public.user_subscriptions.credits_balance IS 'Remaining AI pipeline credits for the billing period.';
COMMENT ON COLUMN public.user_subscriptions.credits_reset_at IS 'When credits_balance resets to the plan allowance.';

-- Post approval metadata
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS generation_id UUID;

-- Credit transactions ledger
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  stage pipeline_stage NOT NULL,
  credits_spent INTEGER NOT NULL CHECK (credits_spent > 0),
  generation_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx
  ON public.credit_transactions (user_id, created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own credit transactions"
    ON public.credit_transactions FOR SELECT
    USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Generation audit trail (one row per pipeline stage invocation)
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  content_plan_id UUID REFERENCES public.content_plans(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  stage pipeline_stage NOT NULL,
  model_used TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'skipped')),
  input_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS generations_user_id_idx
  ON public.generations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS generations_post_id_idx
  ON public.generations (post_id)
  WHERE post_id IS NOT NULL;

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own generations"
    ON public.generations FOR SELECT
    USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Link posts.generation_id after generations table exists
DO $$ BEGIN
  ALTER TABLE public.posts
    ADD CONSTRAINT posts_generation_id_fkey
    FOREIGN KEY (generation_id) REFERENCES public.generations(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Moderation flags (pre-publish screening)
CREATE TABLE IF NOT EXISTS public.moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  flag_type TEXT NOT NULL
    CHECK (flag_type IN ('caption', 'image', 'claim', 'policy', 'other')),
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'block')),
  message TEXT NOT NULL,
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS moderation_flags_post_id_idx
  ON public.moderation_flags (post_id);

ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own moderation flags"
    ON public.moderation_flags FOR SELECT
    USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Seed credits for existing subscriptions from plan defaults
UPDATE public.user_subscriptions
SET credits_balance = CASE plan
  WHEN 'pro' THEN 500
  WHEN 'team' THEN 2000
  ELSE 50
END
WHERE credits_balance = 50;
