-- First-party analytics (no third-party SaaS).
-- product_events: trusted server-side product funnel / usage
-- performance_events: Core Web Vitals RUM samples
-- page_events: cookieless pageviews (consent-gated client)

CREATE TABLE IF NOT EXISTS public.product_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  event text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_events_created_at_idx
  ON public.product_events (created_at DESC);

CREATE INDEX IF NOT EXISTS product_events_event_created_idx
  ON public.product_events (event, created_at DESC);

CREATE INDEX IF NOT EXISTS product_events_user_created_idx
  ON public.product_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.performance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL,
  value double precision NOT NULL,
  rating text,
  path text,
  navigation_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS performance_events_created_at_idx
  ON public.performance_events (created_at DESC);

CREATE INDEX IF NOT EXISTS performance_events_metric_path_idx
  ON public.performance_events (metric, path, created_at DESC);

CREATE TABLE IF NOT EXISTS public.page_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  visitor_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_events_created_at_idx
  ON public.page_events (created_at DESC);

CREATE INDEX IF NOT EXISTS page_events_path_created_idx
  ON public.page_events (path, created_at DESC);

CREATE TABLE IF NOT EXISTS public.page_daily (
  day date NOT NULL,
  path text NOT NULL,
  views integer NOT NULL DEFAULT 0,
  uniques integer NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);

CREATE TABLE IF NOT EXISTS public.performance_daily (
  day date NOT NULL,
  path text NOT NULL,
  metric text NOT NULL,
  sample_count integer NOT NULL DEFAULT 0,
  p75 double precision,
  PRIMARY KEY (day, path, metric)
);

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_daily ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.product_events IS
  'First-party product usage events written by MarketMe servers only.';
COMMENT ON TABLE public.performance_events IS
  'Anonymous Core Web Vitals samples from the browser.';
COMMENT ON TABLE public.page_events IS
  'Consent-gated pageviews; visitor_hash is a daily rotating salt, not a user id.';
