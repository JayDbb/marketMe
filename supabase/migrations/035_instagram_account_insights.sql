-- Cache Instagram Graph insights synced from MarketMe AI publish API.
-- Used to inject "what worked" into Generate until live insights are always available.

CREATE TABLE IF NOT EXISTS public.instagram_account_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  platform text NOT NULL DEFAULT 'instagram',
  handle text,
  external_account_id text,
  period_days integer DEFAULT 30,
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  best_posting_times jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_posts jsonb NOT NULL DEFAULT '[]'::jsonb,
  learning_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw jsonb,
  status text NOT NULL DEFAULT 'empty'
    CHECK (status IN ('empty', 'ready', 'stale', 'unavailable', 'error')),
  last_error text,
  fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT instagram_account_insights_profile_platform_unique
    UNIQUE (business_profile_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_instagram_account_insights_user
  ON public.instagram_account_insights (user_id);

CREATE INDEX IF NOT EXISTS idx_instagram_account_insights_profile
  ON public.instagram_account_insights (business_profile_id);

COMMENT ON TABLE public.instagram_account_insights IS
  'Synced Instagram insights from MarketMe AI publish API for Generate learning loop.';

ALTER TABLE public.instagram_account_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own instagram insights"
  ON public.instagram_account_insights;
CREATE POLICY "Users can read own instagram insights"
  ON public.instagram_account_insights
  FOR SELECT
  USING (user_id = auth.uid()::text OR user_id = (auth.jwt() ->> 'sub'));
