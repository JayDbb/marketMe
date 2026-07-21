-- Scheduling: support non-UUID auth user ids (text user_id on plans/posts).
-- Fixes: invalid input syntax for type uuid: "<external-auth-id>"

ALTER TABLE public.content_plans
  DROP CONSTRAINT IF EXISTS content_plans_user_id_fkey;

ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Drop RLS policies BEFORE altering column types (Postgres 0A000 if policies still reference old type)
DROP POLICY IF EXISTS "Users can view their own content plans" ON public.content_plans;
DROP POLICY IF EXISTS "Users can create their own content plans" ON public.content_plans;
DROP POLICY IF EXISTS "Users can update their own content plans" ON public.content_plans;
DROP POLICY IF EXISTS "Users can delete their own content plans" ON public.content_plans;

DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

ALTER TABLE public.content_plans
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE public.posts
  ALTER COLUMN user_id TYPE text USING user_id::text;

-- RLS: compare as text (matches business_profiles / studio_templates)
CREATE POLICY "Users can view their own content plans"
  ON public.content_plans FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own content plans"
  ON public.content_plans FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own content plans"
  ON public.content_plans FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own content plans"
  ON public.content_plans FOR DELETE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own posts"
  ON public.posts FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (user_id = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.ensure_content_plan_for_user(p_business_name text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid text := COALESCE(auth.jwt() ->> 'sub', auth.uid()::text);
  profile_id uuid;
  plan_id uuid;
  display_name text;
BEGIN
  IF uid IS NULL OR uid = '' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO plan_id
  FROM content_plans
  WHERE user_id = uid
  ORDER BY created_at DESC
  LIMIT 1;

  IF plan_id IS NOT NULL THEN
    RETURN plan_id;
  END IF;

  SELECT id INTO profile_id
  FROM business_profiles
  WHERE user_id = uid
  LIMIT 1;

  IF profile_id IS NULL THEN
    display_name := NULLIF(trim(p_business_name), '');
    IF display_name IS NULL THEN
      display_name := COALESCE(
        NULLIF(trim(auth.jwt() ->> 'full_name'), ''),
        NULLIF(trim(auth.jwt() ->> 'name'), ''),
        NULLIF(split_part(COALESCE(auth.jwt() ->> 'email', ''), '@', 1), ''),
        'My Workspace'
      );
    END IF;

    INSERT INTO business_profiles (user_id, business_name)
    VALUES (uid, display_name)
    RETURNING id INTO profile_id;
  END IF;

  INSERT INTO content_plans (
    user_id,
    business_profile_id,
    start_date,
    end_date,
    strategy_summary,
    status
  )
  VALUES (
    uid,
    profile_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    'Auto-generated weekly plan',
    'active'
  )
  RETURNING id INTO plan_id;

  RETURN plan_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_scheduled_post(
  p_content_plan_id uuid,
  p_platform text,
  p_content text,
  p_scheduled_at timestamptz,
  p_image_url text DEFAULT NULL,
  p_status post_status DEFAULT 'scheduled',
  p_canvas_data jsonb DEFAULT NULL,
  p_template_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid text := COALESCE(auth.jwt() ->> 'sub', auth.uid()::text);
  post_id uuid;
BEGIN
  IF uid IS NULL OR uid = '' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM content_plans
    WHERE id = p_content_plan_id
      AND user_id = uid
  ) THEN
    RAISE EXCEPTION 'Invalid content plan for this user';
  END IF;

  INSERT INTO posts (
    user_id,
    content_plan_id,
    platform,
    content,
    scheduled_at,
    status,
    image_url,
    canvas_data,
    template_id
  )
  VALUES (
    uid,
    p_content_plan_id,
    p_platform,
    p_content,
    p_scheduled_at,
    p_status,
    p_image_url,
    p_canvas_data,
    p_template_id
  )
  RETURNING id INTO post_id;

  RETURN post_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_content_plan_for_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_content_plan_for_user(text) TO authenticated;

REVOKE ALL ON FUNCTION public.create_scheduled_post(
  uuid, text, text, timestamptz, text, post_status, jsonb, uuid
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_scheduled_post(
  uuid, text, text, timestamptz, text, post_status, jsonb, uuid
) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_user_posts(p_scheduled_only boolean DEFAULT false)
RETURNS SETOF posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  uid text := COALESCE(auth.jwt() ->> 'sub', auth.uid()::text);
BEGIN
  IF uid IS NULL OR uid = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM posts p
  WHERE p.user_id = uid
    AND (NOT p_scheduled_only OR p.scheduled_at IS NOT NULL)
  ORDER BY p.scheduled_at ASC NULLS LAST, p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_user_posts(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_user_posts(boolean) TO authenticated;
