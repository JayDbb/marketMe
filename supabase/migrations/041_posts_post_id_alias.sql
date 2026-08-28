-- MarketMe AI publish looks up posts by legacy `post_id`.
-- Current MarketMe schema uses UUID `id` only — mirror it so the live API works
-- before / without a Render redeploy of publish.py.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS post_id uuid;

UPDATE public.posts
SET post_id = id
WHERE post_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS posts_post_id_uidx
  ON public.posts (post_id)
  WHERE post_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_posts_post_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.post_id IS NULL THEN
    NEW.post_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_posts_post_id ON public.posts;
CREATE TRIGGER trg_sync_posts_post_id
  BEFORE INSERT OR UPDATE OF id, post_id
  ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_posts_post_id();

COMMENT ON COLUMN public.posts.post_id IS
  'Legacy alias of id for MarketMe AI publish API compatibility.';
