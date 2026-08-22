-- Instagram inbox messages synced from MarketMe AI / Meta webhooks.

CREATE TABLE IF NOT EXISTS public.inbox_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  connection_id text,
  platform text NOT NULL DEFAULT 'instagram'
    CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter')),
  message_type text NOT NULL DEFAULT 'dm'
    CHECK (message_type IN ('dm', 'mention', 'comment')),
  external_id text,
  author_name text,
  author_handle text,
  author_avatar_url text,
  preview text,
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread', 'read', 'archived')),
  post_url text,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inbox_messages_profile_external_unique
    UNIQUE (business_profile_id, platform, external_id)
);

CREATE INDEX IF NOT EXISTS idx_inbox_messages_user_received
  ON public.inbox_messages (user_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbox_messages_profile_type
  ON public.inbox_messages (business_profile_id, message_type, received_at DESC);

ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own inbox messages"
  ON public.inbox_messages;
CREATE POLICY "Users can read own inbox messages"
  ON public.inbox_messages
  FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles WHERE user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own inbox messages"
  ON public.inbox_messages;
CREATE POLICY "Users can update own inbox messages"
  ON public.inbox_messages
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

DROP TRIGGER IF EXISTS set_inbox_messages_updated_at
  ON public.inbox_messages;
CREATE TRIGGER set_inbox_messages_updated_at
  BEFORE UPDATE ON public.inbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.inbox_messages IS
  'Instagram DMs, mentions, and comments mirrored for the MarketMe inbox UI.';
