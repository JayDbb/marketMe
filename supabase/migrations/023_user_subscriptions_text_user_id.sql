-- user_subscriptions: support Better Auth text user ids (non-UUID)
-- Policies must be dropped BEFORE altering user_id (Postgres 0A000 otherwise).

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;

ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;

ALTER TABLE public.user_subscriptions
  ALTER COLUMN user_id TYPE text USING user_id::text;

CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (user_id = auth.uid()::text);
