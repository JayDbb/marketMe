-- Align business profile RPCs with text user_id columns (matches 010/012 pattern).

-- Must drop first: return type changed from business_profiles → SETOF business_profiles.
DROP FUNCTION IF EXISTS public.get_my_business_profile();

CREATE OR REPLACE FUNCTION public.get_my_business_profile()
RETURNS SETOF public.business_profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT bp.*
  FROM public.business_profiles bp
  WHERE bp.user_id = auth.uid()::text
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.upsert_business_profile(
  p_business_name text DEFAULT NULL,
  p_industry text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_services text DEFAULT NULL,
  p_usp text DEFAULT NULL,
  p_primary_goal text DEFAULT NULL,
  p_social_handle text DEFAULT NULL,
  p_tone text DEFAULT NULL,
  p_target_customers text DEFAULT NULL,
  p_competitors text DEFAULT NULL,
  p_channels text[] DEFAULT '{}'
)
RETURNS public.business_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  profile_row public.business_profiles;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.business_profiles (
    user_id,
    business_name,
    industry,
    location,
    website,
    services,
    usp,
    primary_goal,
    social_handle,
    tone,
    target_customers,
    competitors,
    channels
  )
  VALUES (
    uid::text,
    NULLIF(trim(p_business_name), ''),
    NULLIF(trim(p_industry), ''),
    NULLIF(trim(p_location), ''),
    NULLIF(trim(p_website), ''),
    NULLIF(trim(p_services), ''),
    NULLIF(trim(p_usp), ''),
    NULLIF(trim(p_primary_goal), ''),
    NULLIF(trim(p_social_handle), ''),
    NULLIF(trim(p_tone), ''),
    NULLIF(trim(p_target_customers), ''),
    NULLIF(trim(p_competitors), ''),
    COALESCE(p_channels, '{}')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    business_name = COALESCE(EXCLUDED.business_name, business_profiles.business_name),
    industry = COALESCE(EXCLUDED.industry, business_profiles.industry),
    location = COALESCE(EXCLUDED.location, business_profiles.location),
    website = COALESCE(EXCLUDED.website, business_profiles.website),
    services = COALESCE(EXCLUDED.services, business_profiles.services),
    usp = COALESCE(EXCLUDED.usp, business_profiles.usp),
    primary_goal = COALESCE(EXCLUDED.primary_goal, business_profiles.primary_goal),
    social_handle = COALESCE(EXCLUDED.social_handle, business_profiles.social_handle),
    tone = COALESCE(EXCLUDED.tone, business_profiles.tone),
    target_customers = COALESCE(EXCLUDED.target_customers, business_profiles.target_customers),
    competitors = COALESCE(EXCLUDED.competitors, business_profiles.competitors),
    channels = COALESCE(EXCLUDED.channels, business_profiles.channels),
    updated_at = now()
  RETURNING * INTO profile_row;

  RETURN profile_row;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_business_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_business_profile() TO authenticated;

REVOKE ALL ON FUNCTION public.upsert_business_profile(
  text, text, text, text, text, text, text, text, text, text, text, text[]
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.upsert_business_profile(
  text, text, text, text, text, text, text, text, text, text, text, text[]
) TO authenticated;
