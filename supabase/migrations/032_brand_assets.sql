-- Business brand assets collected during onboarding / settings.

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS logo_url text;

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS brand_colors jsonb;

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS brand_fonts jsonb;

COMMENT ON COLUMN public.business_profiles.brand_colors IS
  'JSON array of hex color strings (max ~5), e.g. ["#0f172a","#ffffff"].';

COMMENT ON COLUMN public.business_profiles.brand_fonts IS
  'JSON array of font family names, e.g. ["Inter","Georgia"].';
