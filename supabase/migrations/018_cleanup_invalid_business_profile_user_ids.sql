-- Remove business profile rows saved with invalid user_id (from pre-017 JS fallback).
-- Safe to run: only deletes rows that cannot match auth.uid().

DELETE FROM public.business_profiles
WHERE user_id IS NOT NULL
  AND user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
