-- Per-user AI model preferences (Generate / revise / images via OpenAI or OpenRouter)
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS ai_provider text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS caption_model text,
  ADD COLUMN IF NOT EXISTS image_model text;

ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_ai_provider_check;

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_ai_provider_check
  CHECK (ai_provider IN ('auto', 'marketme-api', 'openai'));
