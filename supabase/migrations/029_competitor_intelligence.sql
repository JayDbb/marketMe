-- Competitor intelligence: structured competitors + AI-inferred insights.
-- Insights are synthesized from user-provided handles/URLs + optional website
-- text — not live Instagram Graph engagement metrics.

CREATE TABLE IF NOT EXISTS public.business_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL
    REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  label text NOT NULL,
  instagram_handle text,
  website_url text,
  source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('onboarding', 'settings', 'manual')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_competitors_has_identity CHECK (
    instagram_handle IS NOT NULL OR website_url IS NOT NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_competitors_profile_handle
  ON public.business_competitors (business_profile_id, lower(instagram_handle))
  WHERE instagram_handle IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_competitors_profile_website
  ON public.business_competitors (business_profile_id, lower(website_url))
  WHERE website_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_competitors_user_id
  ON public.business_competitors(user_id);

CREATE INDEX IF NOT EXISTS idx_business_competitors_profile_id
  ON public.business_competitors(business_profile_id);

CREATE TABLE IF NOT EXISTS public.competitor_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL UNIQUE
    REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  summary text,
  posting_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  promotional_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  opportunities jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_notes text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'error')),
  last_error text,
  analyzed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_insights_user_id
  ON public.competitor_insights(user_id);

COMMENT ON TABLE public.business_competitors IS
  'User-declared competitors (Instagram handle and/or website)';
COMMENT ON TABLE public.competitor_insights IS
  'AI-inferred competitor patterns and content opportunities for brand brain prompts';

ALTER TABLE public.business_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own competitors"
  ON public.business_competitors;
CREATE POLICY "Users can read own competitors"
  ON public.business_competitors
  FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can read own competitor insights"
  ON public.competitor_insights;
CREATE POLICY "Users can read own competitor insights"
  ON public.competitor_insights
  FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );
