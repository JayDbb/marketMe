-- Add Pexels external ID for saved stock photos (parallel to unsplash_id)
ALTER TABLE public.studio_templates
  ADD COLUMN IF NOT EXISTS pexels_id TEXT;

CREATE INDEX IF NOT EXISTS studio_templates_pexels_id_idx
  ON public.studio_templates (user_id, pexels_id)
  WHERE pexels_id IS NOT NULL;
