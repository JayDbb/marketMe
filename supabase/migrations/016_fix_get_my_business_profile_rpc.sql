-- Fix read RPC: SETOF return + text user_id compatibility (see 010/012).

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

REVOKE ALL ON FUNCTION public.get_my_business_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_business_profile() TO authenticated;
