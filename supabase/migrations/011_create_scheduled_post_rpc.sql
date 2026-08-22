-- Safe to run: no DROP statements. Creates the scheduled-post RPC only.
-- Scheduling in the app uses this function (SECURITY DEFINER bypasses RLS on insert).

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
  uid uuid := auth.uid();
  post_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM content_plans
    WHERE id = p_content_plan_id
      AND user_id::uuid = uid
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

REVOKE ALL ON FUNCTION public.create_scheduled_post(
  uuid, text, text, timestamptz, text, post_status, jsonb, uuid
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_scheduled_post(
  uuid, text, text, timestamptz, text, post_status, jsonb, uuid
) TO authenticated;
