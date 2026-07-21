-- Bootstrap business_profiles + content_plans for users who skipped onboarding.
-- SECURITY DEFINER bypasses RLS while still enforcing auth.uid() = user_id.

CREATE OR REPLACE FUNCTION public.ensure_content_plan_for_user(p_business_name text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  profile_id uuid;
  plan_id uuid;
  display_name text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO plan_id
  FROM content_plans
  WHERE user_id::uuid = uid
  ORDER BY created_at DESC
  LIMIT 1;

  IF plan_id IS NOT NULL THEN
    RETURN plan_id;
  END IF;

  SELECT id INTO profile_id
  FROM business_profiles
  WHERE user_id::uuid = uid
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

REVOKE ALL ON FUNCTION public.ensure_content_plan_for_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_content_plan_for_user(text) TO authenticated;
