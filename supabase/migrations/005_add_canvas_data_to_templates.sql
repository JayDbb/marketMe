-- ============================================================
-- MAR-40: Add Canvas Data to Studio Templates
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Add new columns to support JSON-based templates
ALTER TABLE public.studio_templates 
ADD COLUMN IF NOT EXISTS template_type TEXT NOT NULL DEFAULT 'image' CHECK (template_type IN ('image', 'canvas')),
ADD COLUMN IF NOT EXISTS canvas_data JSONB DEFAULT NULL;

-- 2. Update comments for clarity
COMMENT ON COLUMN public.studio_templates.template_type IS 'Whether this is a flat image or a multi-layer canvas template.';
COMMENT ON COLUMN public.studio_templates.canvas_data IS 'JSON payload defining the canvas size and layers (Konva/Fabric structure).';
