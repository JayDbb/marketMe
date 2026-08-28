-- Persist the last publish failure on the post so Posts can show why it failed
-- and offer Retry. Indexed with the inbox list query (user + status).

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS error_message TEXT;

COMMENT ON COLUMN public.posts.error_message IS
  'Last publish or queue failure. Cleared when the post leaves failed.';

CREATE INDEX IF NOT EXISTS posts_user_id_status_idx
  ON public.posts (user_id, status);

NOTIFY pgrst, 'reload schema';
