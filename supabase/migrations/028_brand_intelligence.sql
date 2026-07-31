-- Brand intelligence: per-business "brand brain" used to guide strategy,
-- captions, hashtags, visuals, and posting times.
-- Built from onboarding profile + Instagram connection metadata + optional
-- website research + AI synthesis. Instagram Graph insights can fill
-- ig_snapshot later when the MarketMe AI publish API exposes them.

CREATE TABLE IF NOT EXISTS public.brand_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL UNIQUE
    REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id text NOT NULL,

  -- Short narrative the model should treat as ground truth
  summary text,

  -- Structured guidance
  content_pillars jsonb NOT NULL DEFAULT '[]'::jsonb,
  audience_insights text,
  voice_guidelines text,
  visual_style text,
  hashtag_seeds jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  posting_windows jsonb NOT NULL DEFAULT '[]'::jsonb,
  trend_hooks jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Raw research snapshots (for debugging / re-synthesis)
  ig_handle text,
  ig_snapshot jsonb,
  website_snapshot text,
  research_notes text,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'stale', 'error')),
  last_error text,
  enriched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_intelligence_user_id
  ON public.brand_intelligence(user_id);

CREATE INDEX IF NOT EXISTS idx_brand_intelligence_status
  ON public.brand_intelligence(status);

COMMENT ON TABLE public.brand_intelligence IS
  'Per-business brand brain for AI strategy/caption/hashtag/timing prompts';

ALTER TABLE public.brand_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own brand intelligence"
  ON public.brand_intelligence;
CREATE POLICY "Users can read own brand intelligence"
  ON public.brand_intelligence
  FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );
