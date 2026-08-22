-- OPTIONAL: Supabase flags this as "destructive" because of DROP POLICY.
-- It does NOT delete table data — only replaces RLS policy definitions.
-- Run after 011 if direct reads/writes still fail due to text vs uuid user_id.
-- Skip if scheduling already works after 011.

DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
CREATE POLICY "Users can view their own posts"
  ON posts FOR SELECT
  USING (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can view their own content plans" ON content_plans;
CREATE POLICY "Users can view their own content plans"
  ON content_plans FOR SELECT
  USING (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can create their own content plans" ON content_plans;
CREATE POLICY "Users can create their own content plans"
  ON content_plans FOR INSERT
  WITH CHECK (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can update their own content plans" ON content_plans;
CREATE POLICY "Users can update their own content plans"
  ON content_plans FOR UPDATE
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own content plans" ON content_plans;
CREATE POLICY "Users can delete their own content plans"
  ON content_plans FOR DELETE
  USING (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can read own profile" ON business_profiles;
CREATE POLICY "Users can read own profile"
  ON business_profiles FOR SELECT
  USING (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can create own profile" ON business_profiles;
CREATE POLICY "Users can create own profile"
  ON business_profiles FOR INSERT
  WITH CHECK (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON business_profiles;
CREATE POLICY "Users can update own profile"
  ON business_profiles FOR UPDATE
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());

DROP POLICY IF EXISTS "Users can delete own profile" ON business_profiles;
CREATE POLICY "Users can delete own profile"
  ON business_profiles FOR DELETE
  USING (user_id::uuid = auth.uid());
