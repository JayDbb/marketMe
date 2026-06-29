-- ============================================================
-- MAR-35: Studio Templates — Storage Bucket + Metadata Table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Create the 'studio-templates' storage bucket (public read URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studio-templates',
  'studio-templates',
  true,
  10485760,  -- 10 MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies
-- Allow authenticated users to upload files into their own user folder
CREATE POLICY "Authenticated users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'studio-templates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update/delete their own files
CREATE POLICY "Users can update own studio files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'studio-templates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own studio files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'studio-templates'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access for anyone to view uploaded images
CREATE POLICY "Public read access for studio templates"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'studio-templates');

-- 3. Create studio_templates metadata table
CREATE TABLE IF NOT EXISTS public.studio_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT,
  file_path   TEXT NOT NULL,    -- relative path in storage bucket: {user_id}/{filename}
  file_url    TEXT NOT NULL,    -- full public CDN URL
  source      TEXT NOT NULL DEFAULT 'upload' CHECK (source IN ('upload', 'unsplash', 'pexels')),
  unsplash_id TEXT,             -- original photo ID for attribution
  author_name TEXT,             -- photographer name (for attribution)
  author_url  TEXT,             -- photographer profile URL
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security on the metadata table
ALTER TABLE public.studio_templates ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for studio_templates table
CREATE POLICY "Users can view their own templates"
  ON public.studio_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON public.studio_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.studio_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.studio_templates FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Index for fast user queries
CREATE INDEX IF NOT EXISTS studio_templates_user_id_idx
  ON public.studio_templates (user_id, created_at DESC);
