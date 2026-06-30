-- List posts for the authenticated user (SECURITY DEFINER avoids RLS read failures).

CREATE OR REPLACE FUNCTION public.list_user_posts(p_scheduled_only boolean DEFAULT false)
RETURNS SETOF posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM posts p
  WHERE p.user_id::uuid = uid
    AND (NOT p_scheduled_only OR p.scheduled_at IS NOT NULL)
  ORDER BY p.scheduled_at ASC NULLS LAST, p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_user_posts(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_user_posts(boolean) TO authenticated;
