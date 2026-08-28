-- MarketMe AI publish/connections order by created_at on social_account.
-- Live table evolved beyond the initial schema but never gained timestamps.

ALTER TABLE public.social_account
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN public.social_account.created_at IS
  'When the social account row was created (used by MarketMe AI publish ordering).';

COMMENT ON COLUMN public.social_account.updated_at IS
  'When the social account row was last updated.';
