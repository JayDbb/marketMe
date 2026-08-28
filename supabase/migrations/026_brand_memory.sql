-- Brand memory: style preferences learned from revise / approve / reject signals.
-- Used as prompt context (not embeddings / fine-tuning).

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS style_notes text,
  ADD COLUMN IF NOT EXISTS preferred_ctas text,
  ADD COLUMN IF NOT EXISTS avoid_phrases text;

COMMENT ON COLUMN public.business_profiles.style_notes IS
  'Bullet list of revise/approve style preferences for AI prompt context';
COMMENT ON COLUMN public.business_profiles.preferred_ctas IS
  'Preferred call-to-action patterns observed from approved posts';
COMMENT ON COLUMN public.business_profiles.avoid_phrases IS
  'Phrases or patterns to avoid, from reject feedback';
