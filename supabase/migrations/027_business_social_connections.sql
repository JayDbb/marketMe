-- Local mirror of social connections for MarketMe dashboard display.
-- OAuth tokens still live on MarketMe AI publish service; this table records
-- that Meta authorized Instagram for a business profile so the UI can show
-- connected even when GET /publish/connections fails (e.g. SecretStr bugs).

CREATE TABLE IF NOT EXISTS public.business_social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  platform text NOT NULL
    CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter')),
  handle text,
  display_name text,
  status text NOT NULL DEFAULT 'connected'
    CHECK (status IN ('connected', 'disconnected', 'expired', 'error', 'connecting')),
  external_account_id text,
  source text NOT NULL DEFAULT 'marketme-ai'
    CHECK (source IN ('marketme-ai', 'oauth-return', 'manual')),
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_social_connections_profile_platform_unique
    UNIQUE (business_profile_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_business_social_connections_user_id
  ON public.business_social_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_business_social_connections_profile_id
  ON public.business_social_connections(business_profile_id);

ALTER TABLE public.business_social_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own social connections"
  ON public.business_social_connections;
CREATE POLICY "Users can read own social connections"
  ON public.business_social_connections
  FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own social connections"
  ON public.business_social_connections;
CREATE POLICY "Users can insert own social connections"
  ON public.business_social_connections
  FOR INSERT
  WITH CHECK (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own social connections"
  ON public.business_social_connections;
CREATE POLICY "Users can update own social connections"
  ON public.business_social_connections
  FOR UPDATE
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own social connections"
  ON public.business_social_connections;
CREATE POLICY "Users can delete own social connections"
  ON public.business_social_connections
  FOR DELETE
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );

DROP TRIGGER IF EXISTS set_business_social_connections_updated_at
  ON public.business_social_connections;
CREATE TRIGGER set_business_social_connections_updated_at
  BEFORE UPDATE ON public.business_social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.business_social_connections IS
  'Dashboard mirror of connected social accounts. Tokens remain on MarketMe AI publish API.';
