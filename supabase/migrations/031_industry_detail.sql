-- Optional free-text note when industry = 'Other' (keeps industry column analytics-clean).

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS industry_detail text;
